package handlers

import (
	"net/http"

	"kredly/internal/database"
	"kredly/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type TokenHandler struct{}

func NewTokenHandler() *TokenHandler {
	return &TokenHandler{}
}

// HandleGetTokenBalance mengembalikan saldo token/kredit user saat ini
// GET /api/user/me/token-balance
func (h *TokenHandler) HandleGetTokenBalance(c *gin.Context) {
	// Ambil session dari context (di-set oleh AuthMiddleware)
	sessionVal, exists := c.Get("session")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	session, ok := sessionVal.(models.ASession)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid session data"})
		return
	}

	userColl := database.DB.Collection("user")

	var user models.User
	err := userColl.FindOne(c.Request.Context(), bson.M{"_id": session.UserID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Jika user lama belum punya tokenBalance, kembalikan default 0
	if user.TokenBalance == nil {
		c.JSON(http.StatusOK, gin.H{
			"current":     0,
			"totalEarned": 0,
			"totalSpent":  0,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"current":     user.TokenBalance.Current,
		"totalEarned": user.TokenBalance.TotalEarned,
		"totalSpent":  user.TokenBalance.TotalSpent,
	})
}
