package handlers

import (
	"context"
	"net/http"
	"time"

	"kredly/internal/database"
	"kredly/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

type OnboardingHandler struct{}

func NewOnboardingHandler() *OnboardingHandler {
	return &OnboardingHandler{}
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
	file, header, err := c.Request.FormFile("cvFile")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CV file is required"})
		return
	}
	defer file.Close()

	// TODO: Upload file ke storage (S3/local/etc)
	// Untuk sekarang, simpan nama file saja
	cvFileName := header.Filename
	cvFilePath := "/uploads/cv/" + userID + "_" + cvFileName // Path placeholder

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
