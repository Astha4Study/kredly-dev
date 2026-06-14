package handlers

import (
	"net/http"
	"os"

	"kredly/internal/groq"
	"kredly/internal/pdf"

	"github.com/gin-gonic/gin"
)

type CVHandler struct {
	groqClient *groq.Client
}

func NewCVHandler(groqClient *groq.Client) *CVHandler {
	return &CVHandler{
		groqClient: groqClient,
	}
}

// HandleParseCV receives a PDF file, extracts text, sends it to Groq API, and returns JSON
func (h *CVHandler) HandleParseCV(c *gin.Context) {
	// 1. Get file from form
	file, err := c.FormFile("cv")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read file from request: " + err.Error()})
		return
	}

	// 2. Create a temporary file
	tempFile, err := os.CreateTemp("", "cv-*.pdf")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create temp file: " + err.Error()})
		return
	}
	tempPath := tempFile.Name()
	tempFile.Close()
	defer os.Remove(tempPath)

	// 3. Save uploaded file to temp path
	if err := c.SaveUploadedFile(file, tempPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file: " + err.Error()})
		return
	}

	// 4. Extract text from PDF
	text, err := pdf.ReadPDFText(tempPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract text from PDF: " + err.Error()})
		return
	}

	if len(text) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "The uploaded PDF file does not contain any readable text"})
		return
	}

	// 5. Build prompt for Groq
	systemPrompt := `You are an expert ATS (Applicant Tracking System) CV parser. 
Extract all information from the provided CV text and output it as a structured JSON object. 
The JSON must follow this exact schema:
{
  "role": "Candidate's primary role or title (e.g., Backend Engineer)",
  "level": "Candidate's seniority level (e.g., Junior, Mid, Senior, Lead)",
  "skills": ["Skill 1", "Skill 2"]
}

Ensure all fields are populated as accurately as possible based on the text. If a field is missing, set it to null or an empty array/string. Do not include any markdown format tags like ` + "`" + `json` + "`" + ` or any conversational intro/outro text. Return ONLY the raw JSON object.`

	// 6. Request Chat Completion from Groq with JSON Mode
	groqReq := groq.ChatCompletionRequest{
		Messages: []groq.Message{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: text},
		},
		Model: "qwen/qwen3-32b",
		ResponseFormat: &groq.ResponseFormat{
			Type: "json_object",
		},
	}

	resp, err := h.groqClient.CreateChatCompletion(groqReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to parse CV content via Groq API",
			"details": err.Error(),
		})
		return
	}

	if len(resp.Choices) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Groq API returned an empty completion"})
		return
	}

	// 7. Send the JSON string response directly
	c.Data(http.StatusOK, "application/json", []byte(resp.Choices[0].Message.Content))
}
