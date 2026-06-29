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

// TopupRequest mewakili request body untuk top up token
type TopupRequest struct {
	Credits int `json:"credits" binding:"required"`
}

// HandleSimulateTopup mensimulasikan pembelian token dan menambahkan ke saldo user
// POST /api/user/me/topup
func (h *TokenHandler) HandleSimulateTopup(c *gin.Context) {
	// Ambil session dari context
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

	var req TopupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Tentukan bonus dan pastikan jumlah kredit valid
	var bonus int
	switch req.Credits {
	case 300:
		bonus = 10
	case 500:
		bonus = 25
	case 1000:
		bonus = 100
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Paket kredit tidak valid"})
		return
	}

	totalToAdd := req.Credits + bonus
	userColl := database.DB.Collection("user")

	// Lakukan update saldo token user
	update := bson.M{
		"$inc": bson.M{
			"tokenBalance.current":     totalToAdd,
			"tokenBalance.totalEarned": totalToAdd,
		},
	}

	_, err := userColl.UpdateOne(c.Request.Context(), bson.M{"_id": session.UserID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan saldo token"})
		return
	}

	// Ambil data user terupdate
	var updatedUser models.User
	err = userColl.FindOne(c.Request.Context(), bson.M{"_id": session.UserID}).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data user terbaru"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Top up berhasil disimulasikan",
		"added":   totalToAdd,
		"current": updatedUser.TokenBalance.Current,
	})
}
