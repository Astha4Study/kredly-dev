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

	// Get images from frontend (rendered by PDF.js)
	cvImagesJSON := c.PostForm("cvImages")
	var cvImages []string
	if cvImagesJSON != "" {
		if err := json.Unmarshal([]byte(cvImagesJSON), &cvImages); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cvImages format: " + err.Error()})
			return
		}
	}

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

	// 3. Ekstrak teks dari PDF (dengan vision fallback untuk image-based PDFs)
	text, err := pdf.ReadPDFTextWithVisionFallback(tempPath, h.groqClient, cvImages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to extract text from PDF: " + err.Error()})
		return
	}

	// 4. Panggil Groq API untuk parse data CV jika groqClient diinisialisasi
	var parsedRole *string
	var parsedLevel *string
	var parsedSkills []string
	var cvSummary *string
	var parsedAssessments []models.GeneratedAssessment

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
  "summary": "A concise, clean, and professional summary of the candidate's profile, key experience, and education. Keep it brief (2-3 sentences max) as a single plain paragraph. Do NOT include any special characters, list bullet points, or symbols like '●' or '•'.",
  "assessments": [
    {
      "id": "A unique slug/ID like gen-frontend, skill-typescript, or rel-deep-learning",
      "type": "general", "skill", or "related_skill",
      "title": "Assessment title (e.g. Front End, Backend, TypeScript, Go)",
      "description": "Short description of what is tested",
      "difficulty": "Beginner", "Intermediate", or "Advanced" based on candidate level,
      "estimatedTime": "Estimated time (e.g. '90 menit' for general, '45 menit' for skill/related_skill)",
      "questionCount": number of questions (e.g., 50 for general, 30 for skill/related_skill),
      "topics": ["list of key topics/subjects tested"] (only for type "general", empty or null for other types),
      "isRecommended": true,
      "category": "Frontend", "Backend", "Mobile", "DevOps", "Database", "General" etc.,
      "status": "available"
    }
  ]
}

For the "assessments" field:
1. Generate exactly 1 "general" assessment matching the candidate's overall role (e.g., "Front End", "Backend", "Mobile Developer", "DevOps") with 3-5 relevant "topics" to be tested. The "questionCount" must be 50 and "estimatedTime" must be "90 menit".
2. Generate 3-5 skill-related assessments: 2-3 of these must directly match the candidate's top extracted skills (e.g., "TypeScript", "Node.js", "Docker") and have "type": "skill". In addition, generate 1-2 assessments that are outside their direct skills list but highly related or complementary to their domain (e.g., if they have "Machine Learning", add "Deep Learning" or "NLP"; if they have "React", add "Next.js" or "TypeScript") and have "type": "related_skill". The "questionCount" for all these must be 30 and "estimatedTime" must be "45 menit".
3. Choose the "difficulty" matching their cv level (Junior -> Beginner/Intermediate, Mid -> Intermediate, Senior/Lead -> Advanced).
4. Assign a unique slug/ID for each assessment (e.g., "gen-frontend" for general, "skill-typescript" for skill, "rel-deep-learning" for related_skill).
5. The "status" of each assessment should be "available".
6. The "category" should align with the candidate's domain (e.g., "Frontend", "Backend", "Mobile", "DevOps", "Database", "General").

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
				Role        string                       `json:"role"`
				Level       string                       `json:"level"`
				Skills      []string                     `json:"skills"`
				Summary     string                       `json:"summary"`
				Assessments []models.GeneratedAssessment `json:"assessments"`
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
				parsedAssessments = parsed.Assessments
			}
		}
	}
	// -------------------------

	// VALIDASI: Jangan save ke database jika parsing gagal
	// Check apakah CV berhasil di-parse dengan baik
	hasValidSkills := len(parsedSkills) > 0
	hasValidSummary := cvSummary != nil && len(strings.TrimSpace(*cvSummary)) > 30 // Lowered from 50 to 30 for better tolerance

	if !hasValidSkills || !hasValidSummary {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "CV tidak dapat dibaca dengan baik. Pastikan CV Anda berisi text yang dapat dibaca atau gambar yang jelas. Silakan upload ulang cv.",
			"details": gin.H{
				"hasSkills":  hasValidSkills,
				"hasSummary": hasValidSummary,
			},
		})
		return
	}

	// Cek duplicate username sebelum update
	userColl := database.DB.Collection("user")
	var existingUser models.User
	if err := userColl.FindOne(context.Background(), bson.M{"username": username, "_id": bson.M{"$ne": userID}}).Decode(&existingUser); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username sudah digunakan"})
		return
	}

	// Update User (fullName dan username)
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
		ID:            uuid.New().String(),
		UserID:        userID,
		CVFileName:    cvFileName,
		CVFilePath:    cvFilePath,
		Experience:    experience,
		IsStudent:     isStudent,
		Degree:        &degree,
		CVRole:        parsedRole,
		CVLevel:       parsedLevel,
		CVSkills:      parsedSkills,
		CVSummary:     cvSummary,
		CVAssessments: parsedAssessments,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	_, err = userProfileColl.InsertOne(context.Background(), userProfile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile"})
		return
	}

	// Log onboarding completed activity
	skillsCount := len(parsedSkills)
	models.LogActivityAsync(
		database.DB,
		userID,
		models.ActivityOnboardingCompleted,
		"Onboarding Selesai",
		"Anda telah menyelesaikan proses onboarding dan mengunggah CV",
		&models.ActivityMetadata{
			FileName: &cvFileName,
			Skills:   parsedSkills[:min(5, skillsCount)], // Top 5 skills
		},
	)

	// Return parsed data untuk validasi di frontend
	response := gin.H{
		"success": true,
		"message": "Onboarding completed successfully",
		"profile": gin.H{
			"cvRole":    parsedRole,
			"cvLevel":   parsedLevel,
			"cvSkills":  parsedSkills,
			"cvSummary": cvSummary,
		},
	}

	c.JSON(http.StatusOK, response)
}

// Helper function to get minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
