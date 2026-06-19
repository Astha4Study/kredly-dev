package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"kredly/internal/database"
	"kredly/internal/groq"
	"kredly/internal/models"
	"kredly/internal/pdf"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
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
	// Get logged-in user from context (if authenticated)
	var loggedInUser *models.User
	if userVal, exists := c.Get("user"); exists {
		if u, ok := userVal.(models.User); ok {
			loggedInUser = &u
		}
	}

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
  "skills": ["Skill 1", "Skill 2"],
  "summary": "A concise, clean, and professional summary of the candidate's profile, key experience, and education. Keep it brief (2-3 sentences max) as a single plain paragraph. Do NOT include any special characters, list bullet points, or symbols like '●' or '•'.",
  "assessments": [
    {
      "id": "A unique slug/ID like gen-frontend or skill-typescript",
      "type": "general" or "skill",
      "title": "Assessment title (e.g. Front End, Backend, TypeScript, Go)",
      "description": "Short description of what is tested",
      "difficulty": "Beginner", "Intermediate", or "Advanced" based on candidate level,
      "estimatedTime": "Estimated time (e.g. '30 menit', '45 menit')",
      "questionCount": number of questions (e.g., 20 or 25),
      "topics": ["list of key topics/subjects tested"] (only for type "general", empty or null for "skill"),
      "isRecommended": true,
      "category": "Frontend", "Backend", "Mobile", "DevOps", "Database", "General" etc.,
      "status": "available"
    }
  ]
}

For the "assessments" field:
1. Generate exactly 1 "general" assessment matching the candidate's overall role (e.g., "Front End", "Backend", "Mobile Developer", "DevOps") with 3-5 relevant "topics" to be tested.
2. Generate 3-5 "skill" assessments matching the candidate's top extracted skills (e.g., "TypeScript", "Node.js", "Docker").
3. Choose the "difficulty" matching their cv level (Junior -> Beginner/Intermediate, Mid -> Intermediate, Senior/Lead -> Advanced).
4. Assign a unique slug/ID for each assessment (e.g., "gen-frontend", "skill-typescript").
5. The "status" of each assessment should be "available".
6. The "category" should align with the candidate's domain (e.g., "Frontend", "Backend", "Mobile", "DevOps", "Database", "General").

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

	rawContent := resp.Choices[0].Message.Content
	cleanJSON := strings.TrimSpace(rawContent)

	// Clean markdown block wrappers if present (e.g. ```json ... ```)
	if strings.HasPrefix(cleanJSON, "```") {
		lines := strings.Split(cleanJSON, "\n")
		var validLines []string
		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if !strings.HasPrefix(trimmed, "```") {
				validLines = append(validLines, line)
			}
		}
		cleanJSON = strings.Join(validLines, "\n")
	}
	cleanJSON = strings.TrimSpace(cleanJSON)

	// 7. Save parsed results to the user profile if logged in
	if loggedInUser != nil {
		type parsedCV struct {
			Role        string                       `json:"role"`
			Level       string                       `json:"level"`
			Skills      []string                     `json:"skills"`
			Summary     string                       `json:"summary"`
			Assessments []models.GeneratedAssessment `json:"assessments"`
		}

		var parsed parsedCV
		if err := json.Unmarshal([]byte(cleanJSON), &parsed); err == nil {
			userColl := database.DB.Collection("user")
			now := time.Now()

			cvSummary := parsed.Summary
			if cvSummary == "" {
				cleanedText := text
				cleanedText = strings.ReplaceAll(cleanedText, "●", "")
				cleanedText = strings.ReplaceAll(cleanedText, "•", "")
				cleanedText = strings.ReplaceAll(cleanedText, "*", "")
				words := strings.Fields(cleanedText)
				cleanedText = strings.Join(words, " ")
				if len(cleanedText) > 400 {
					cleanedText = cleanedText[:397] + "..."
				}
				cvSummary = cleanedText
			}

			update := bson.M{
				"$set": bson.M{
					"cvRole":     parsed.Role,
					"cvLevel":    parsed.Level,
					"cvSkills":   parsed.Skills,
					"cvSummary":  cvSummary,
					"cvParsedAt": now,
					"updatedAt":  now,
				},
			}

			_, updateErr := userColl.UpdateOne(c.Request.Context(), bson.M{"_id": loggedInUser.ID}, update)
			if updateErr != nil {
				// Log the error but don't fail the request since parsing succeeded
				c.Error(updateErr)
			}

			// Update UserProfile document as well
			userProfileColl := database.DB.Collection("userProfile")
			profileUpdate := bson.M{
				"$set": bson.M{
					"cvRole":        parsed.Role,
					"cvLevel":       parsed.Level,
					"cvSkills":      parsed.Skills,
					"cvSummary":     cvSummary,
					"cvAssessments": parsed.Assessments,
					"updatedAt":     now,
				},
			}
			_, updateErrProfile := userProfileColl.UpdateOne(c.Request.Context(), bson.M{"userId": loggedInUser.ID}, profileUpdate)
			if updateErrProfile != nil {
				c.Error(updateErrProfile)
			}
		}
	}

	// 8. Send the JSON string response directly
	c.Data(http.StatusOK, "application/json", []byte(cleanJSON))
}

