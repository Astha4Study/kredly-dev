package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"kredly/internal/database"
	"kredly/internal/groq"
	"kredly/internal/models"
	"kredly/internal/pdf"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

type ProfileHandler struct {
	groqClient *groq.Client
}

func NewProfileHandler(groqClient *groq.Client) *ProfileHandler {
	return &ProfileHandler{
		groqClient: groqClient,
	}
}

// HandleCheckUsername checks if a username is already taken
func (h *ProfileHandler) HandleCheckUsername(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	userColl := database.DB.Collection("user")
	var existingUser models.User
	err := userColl.FindOne(c.Request.Context(), bson.M{"username": username}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username sudah digunakan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"available": true})
}

// HandleGetProfile returns the UserProfile for the authenticated user
func (h *ProfileHandler) HandleGetProfile(c *gin.Context) {
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

	// Debug log
	println("🔍 [DEBUG] Fetching UserProfile for userId:", userID)

	// Fetch UserProfile dari database
	userProfileColl := database.DB.Collection("userProfile")
	var userProfile models.UserProfile
	err := userProfileColl.FindOne(c.Request.Context(), bson.M{"userId": userID}).Decode(&userProfile)

	if err != nil {
		// Debug log
		println("❌ [DEBUG] UserProfile not found:", err.Error())

		// UserProfile tidak ditemukan
		c.JSON(http.StatusOK, gin.H{
			"profile": nil,
			"message": "No profile found",
			"userId":  userID, // Return userId for debugging
		})
		return
	}

	// Debug log
	println("✅ [DEBUG] UserProfile found:", userProfile.ID)

	c.JSON(http.StatusOK, gin.H{
		"profile": userProfile,
	})
}

// HandleUpdateProfile updates user's name and username
func (h *ProfileHandler) HandleUpdateProfile(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

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

	var req struct {
		Name     string `json:"name" binding:"required"`
		Username string `json:"username"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	ctx := c.Request.Context()
	userColl := database.DB.Collection("user")

	// Check if username is being changed and if it's unique
	if req.Username != "" {
		var existingUser models.User
		err := userColl.FindOne(ctx, bson.M{
			"username": req.Username,
			"_id":      bson.M{"$ne": userID},
		}).Decode(&existingUser)

		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username sudah digunakan"})
			return
		}
	}

	// Build update document
	updateDoc := bson.M{
		"name":      req.Name,
		"updatedAt": time.Now(),
	}

	if req.Username != "" {
		updateDoc["username"] = req.Username
	}

	// Update user
	result, err := userColl.UpdateOne(
		ctx,
		bson.M{"_id": userID},
		bson.M{"$set": updateDoc},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui profil"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profil berhasil diperbarui",
		"name":    req.Name,
		"username": req.Username,
	})
}

// HandleUploadCV handles CV file upload, parsing, and updating UserProfile
func (h *ProfileHandler) HandleUploadCV(c *gin.Context) {
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

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

	// Get the uploaded file
	file, err := c.FormFile("cv")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File CV tidak ditemukan"})
		return
	}

	// Validate file type
	if file.Header.Get("Content-Type") != "application/pdf" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File harus berformat PDF"})
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ukuran file maksimal 5MB"})
		return
	}

	// Create uploads directory if not exists
	uploadDir := "./uploads/cv"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat direktori upload"})
		return
	}

	// Generate unique filename
	fileExt := filepath.Ext(file.Filename)
	fileName := fmt.Sprintf("%s_%s%s", userID, uuid.New().String(), fileExt)
	filePath := filepath.Join(uploadDir, fileName)

	// Save the file permanently
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file"})
		return
	}

	// Parse CV - extract text and analyze with Groq
	var parsedRole, parsedLevel, parsedSummary string
	var parsedSkills []string

	// This parsing is optional - if it fails, we still save the file
	if text, err := pdf.ReadPDFText(filePath); err == nil && len(text) > 0 {
		// Build prompt for Groq (simplified version focused on profile data)
		systemPrompt := `You are an expert CV parser. Extract the following information from the CV text and output as JSON:
{
  "role": "Primary role or job title",
  "level": "Seniority level (Junior, Mid, Senior, Lead)",
  "skills": ["skill1", "skill2", ...],
  "summary": "Brief 2-3 sentence professional summary"
}
Return ONLY the JSON object, no markdown or extra text.`

		groqReq := groq.ChatCompletionRequest{
			Messages: []groq.Message{
				{Role: "system", Content: systemPrompt},
				{Role: "user", Content: text},
			},
			Model: "llama-3.3-70b-versatile",
			ResponseFormat: &groq.ResponseFormat{
				Type: "json_object",
			},
		}

		if resp, err := h.groqClient.CreateChatCompletion(groqReq); err == nil && len(resp.Choices) > 0 {
			var parsed struct {
				Role    string   `json:"role"`
				Level   string   `json:"level"`
				Skills  []string `json:"skills"`
				Summary string   `json:"summary"`
			}
			if json.Unmarshal([]byte(resp.Choices[0].Message.Content), &parsed) == nil {
				parsedRole = parsed.Role
				parsedLevel = parsed.Level
				parsedSkills = parsed.Skills
				parsedSummary = parsed.Summary
			}
		}
	}

	ctx := c.Request.Context()
	userProfileColl := database.DB.Collection("userProfile")

	// Prepare update document
	updateDoc := bson.M{
		"cvFileName": file.Filename,
		"cvFilePath": filePath,
		"updatedAt":  time.Now(),
	}

	// Add parsed data if available
	if parsedRole != "" {
		updateDoc["cvRole"] = parsedRole
	}
	if parsedLevel != "" {
		updateDoc["cvLevel"] = parsedLevel
	}
	if len(parsedSkills) > 0 {
		updateDoc["cvSkills"] = parsedSkills
	}
	if parsedSummary != "" {
		updateDoc["cvSummary"] = parsedSummary
	}

	// Update or insert UserProfile
	filter := bson.M{"userId": userID}
	update := bson.M{"$set": updateDoc}

	var userProfile models.UserProfile
	err = userProfileColl.FindOneAndUpdate(ctx, filter, update).Decode(&userProfile)

	// If profile doesn't exist, create new one
	if err != nil {
		newProfile := models.UserProfile{
			ID:         uuid.New().String(),
			UserID:     userID,
			CVFileName: file.Filename,
			CVFilePath: filePath,
			Experience: "not-specified",
			IsStudent:  false,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		if parsedRole != "" {
			newProfile.CVRole = &parsedRole
		}
		if parsedLevel != "" {
			newProfile.CVLevel = &parsedLevel
		}
		if len(parsedSkills) > 0 {
			newProfile.CVSkills = parsedSkills
		}
		if parsedSummary != "" {
			newProfile.CVSummary = &parsedSummary
		}

		_, err = userProfileColl.InsertOne(ctx, newProfile)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan profil"})
			return
		}
	}

	// Return response
	response := gin.H{
		"message":    "CV berhasil diupload",
		"cvFileName": file.Filename,
		"cvFilePath": filePath,
	}

	if parsedRole != "" {
		response["cvRole"] = parsedRole
	}
	if parsedLevel != "" {
		response["cvLevel"] = parsedLevel
	}
	if len(parsedSkills) > 0 {
		response["cvSkills"] = parsedSkills
	}
	if parsedSummary != "" {
		response["cvSummary"] = parsedSummary
	}

	c.JSON(http.StatusOK, response)
}

// HandleDeleteAccount permanently deletes a user account and all related data
func (h *ProfileHandler) HandleDeleteAccount(c *gin.Context) {
	// Get user from context (set by middleware)
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Extract user data
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

	userEmail, ok := userMap["email"].(string)
	if !ok || userEmail == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user email"})
		return
	}

	ctx := c.Request.Context()

	// Start deleting all related data
	// 1. Delete all Sessions
	sessionColl := database.DB.Collection("session")
	_, err := sessionColl.DeleteMany(ctx, bson.M{"userId": userID})
	if err != nil {
		println("⚠️ [DELETE] Failed to delete sessions:", err.Error())
	}

	// 2. Delete all Accounts (OAuth connections)
	accountColl := database.DB.Collection("account")
	_, err = accountColl.DeleteMany(ctx, bson.M{"userId": userID})
	if err != nil {
		println("⚠️ [DELETE] Failed to delete accounts:", err.Error())
	}

	// 3. Delete UserProfile
	userProfileColl := database.DB.Collection("userProfile")
	_, err = userProfileColl.DeleteOne(ctx, bson.M{"userId": userID})
	if err != nil {
		println("⚠️ [DELETE] Failed to delete user profile:", err.Error())
	}

	// 4. Delete Verifications (email verification tokens)
	verificationColl := database.DB.Collection("verification")
	_, err = verificationColl.DeleteMany(ctx, bson.M{"identifier": userEmail})
	if err != nil {
		println("⚠️ [DELETE] Failed to delete verifications:", err.Error())
	}

	// 5. Finally, delete the User document
	userColl := database.DB.Collection("user")
	result, err := userColl.DeleteOne(ctx, bson.M{"_id": userID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user account"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Clear the session cookie
	c.SetCookie("session_token", "", -1, "/", "", false, true)

	println("✅ [DELETE] Successfully deleted user account:", userID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Account successfully deleted",
	})
}
