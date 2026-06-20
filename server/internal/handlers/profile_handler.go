package handlers

import (
	"net/http"

	"kredly/internal/database"
	"kredly/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type ProfileHandler struct{}

func NewProfileHandler() *ProfileHandler {
	return &ProfileHandler{}
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
