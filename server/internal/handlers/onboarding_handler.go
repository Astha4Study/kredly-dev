package handlers

import (
	"context"
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
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

type OnboardingHandler struct {
	groqClient *groq.Client
}

func NewOnboardingHandler(groqClient *groq.Client) *OnboardingHandler {
	return &OnboardingHandler{
		groqClient: groqClient,
	}
}

// HandleCompleteOnboarding menyimpan data onboarding user ke UserProfile
func (h *OnboardingHandler) HandleCompleteOnboarding(c *gin.Context) {
	// Ambil user dari context (sudah di-set oleh middleware)
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// User dari middleware adalah gin.H (map), extract userID
	userMap, ok := userInterface.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
		return
	}

	userID, ok := userMap["id"].(string)
	if !ok || userID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse multipart form (untuk file CV)
	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	// Ambil data dari form
	fullName := c.PostForm("fullName")
	username := c.PostForm("username")
	experience := c.PostForm("experience")
	isStudent := c.PostForm("isStudent") == "true"
	degree := c.PostForm("degree")

	// Validasi required fields
	if fullName == "" || username == "" || experience == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// Handle file upload CV
	header, err := c.FormFile("cvFile")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CV file is required: " + err.Error()})
		return
	}

	// TODO: Upload file ke storage (S3/local/etc)
	// Untuk sekarang, simpan nama file saja
	cvFileName := header.Filename
	cvFilePath := "/uploads/cv/" + userID + "_" + cvFileName // Path placeholder

	// --- PROSES PARSING CV ---
	// 1. Buat file temporer
	tempFile, err := os.CreateTemp("", "cv-*.pdf")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create temp file: " + err.Error()})
		return
	}
	tempPath := tempFile.Name()
	tempFile.Close()
	defer os.Remove(tempPath)

	// 2. Simpan file yang diupload ke temp path
	if err := c.SaveUploadedFile(header, tempPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file: " + err.Error()})
		return
	}

	// 3. Ekstrak teks dari PDF
	text, err := pdf.ReadPDFText(tempPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract text from PDF: " + err.Error()})
		return
	}

	// 4. Panggil Groq API untuk parse data CV jika groqClient diinisialisasi
	var parsedRole *string
	var parsedLevel *string
	var parsedSkills []string
	var cvSummary *string

	// Fallback pembersihan teks mentah (menghapus simbol bullet seperti ● atau •)
	if len(text) > 0 {
		cleanedText := text
		// Hapus simbol bullet bulat yang sering muncul
		cleanedText = strings.ReplaceAll(cleanedText, "●", "")
		cleanedText = strings.ReplaceAll(cleanedText, "•", "")
		cleanedText = strings.ReplaceAll(cleanedText, "*", "")
		// Bersihkan whitespace berlebih
		words := strings.Fields(cleanedText)
		cleanedText = strings.Join(words, " ")

		// Batasi panjang fallback summary agar tidak terlalu panjang
		if len(cleanedText) > 400 {
			cleanedText = cleanedText[:397] + "..."
		}
		cvSummary = &cleanedText
	}

	if h.groqClient != nil && len(text) > 0 {
		systemPrompt := `You are an expert ATS (Applicant Tracking System) CV parser. 
Extract all information from the provided CV text and output it as a structured JSON object. 
The JSON must follow this exact schema:
{
  "role": "Candidate's primary role or title (e.g., Backend Engineer)",
  "level": "Candidate's seniority level (e.g., Junior, Mid, Senior, Lead)",
  "skills": ["Skill 1", "Skill 2"],
  "summary": "A concise, clean, and professional summary of the candidate's profile, key experience, and education. Keep it brief (2-3 sentences max) as a single plain paragraph. Do NOT include any special characters, list bullet points, or symbols like '●' or '•'."
}

Ensure all fields are populated as accurately as possible based on the text. If a field is missing, set it to null or an empty array/string. Do not include any markdown format tags like ` + "`" + `json` + "`" + ` or any conversational intro/outro text. Return ONLY the raw JSON object.`

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
		if err == nil && len(resp.Choices) > 0 {
			rawContent := resp.Choices[0].Message.Content
			cleanJSON := strings.TrimSpace(rawContent)

			// Bersihkan format markdown ```json jika ada
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

			type parsedCV struct {
				Role    string   `json:"role"`
				Level   string   `json:"level"`
				Skills  []string `json:"skills"`
				Summary string   `json:"summary"`
			}

			var parsed parsedCV
			if err := json.Unmarshal([]byte(cleanJSON), &parsed); err == nil {
				if parsed.Role != "" {
					parsedRole = &parsed.Role
				}
				if parsed.Level != "" {
					parsedLevel = &parsed.Level
				}
				parsedSkills = parsed.Skills
				if parsed.Summary != "" {
					cvSummary = &parsed.Summary
				}
			}
		}
	}
	// -------------------------

	// Update User (fullName dan username)
	userColl := database.DB.Collection("user")
	_, err = userColl.UpdateOne(
		context.Background(),
		bson.M{"_id": userID},
		bson.M{
			"$set": bson.M{
				"name":      fullName,
				"username":  username,
				"updatedAt": time.Now(),
			},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Simpan UserProfile
	userProfileColl := database.DB.Collection("userProfile")
	now := time.Now()

	userProfile := models.UserProfile{
		ID:         uuid.New().String(),
		UserID:     userID,
		CVFileName: cvFileName,
		CVFilePath: cvFilePath,
		Experience: experience,
		IsStudent:  isStudent,
		Degree:     &degree,
		CVRole:     parsedRole,
		CVLevel:    parsedLevel,
		CVSkills:   parsedSkills,
		CVSummary:  cvSummary,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	_, err = userProfileColl.InsertOne(context.Background(), userProfile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Onboarding completed successfully",
	})
}
