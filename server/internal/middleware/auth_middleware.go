package middleware

import (
	"net/http"
	"time"

	"kredly/internal/config"
	"kredly/internal/database"
	"kredly/internal/models"
	"kredly/internal/service"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// AuthMiddleware memvalidasi session dan auto-refresh jika mendekati expired
func AuthMiddleware(cfg *config.Config, authService *service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ambil token dari cookie
		token, err := c.Cookie("auth_session")
		if err != nil || token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		sessionColl := database.DB.Collection("session")
		userColl := database.DB.Collection("user")

		// Cari sesi di DB
		var session models.ASession
		err = sessionColl.FindOne(c.Request.Context(), bson.M{"token": token}).Decode(&session)
		if err != nil || session.ExpiresAt.Before(time.Now()) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			c.Abort()
			return
		}

		// Cari user yang memiliki sesi ini
		var user models.User
		err = userColl.FindOne(c.Request.Context(), bson.M{"_id": session.UserID}).Decode(&user)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Simpan user ke context untuk digunakan di handler
		c.Set("user", user)
		c.Set("session", session)

		// Auto-refresh token jika mendekati expired (2 hari sebelum habis)
		if authService.ShouldRefreshSession(session.ExpiresAt) {
			newSession, err := authService.RefreshSession(c.Request.Context(), token, user.ID)
			if err == nil {
				// Update cookie dengan token baru
				maxAge := 7 * 24 * 60 * 60
				isSecure := cfg.Environment == "production"
				sameSite := http.SameSiteLaxMode
				if isSecure {
					sameSite = http.SameSiteStrictMode
				}

				c.SetSameSite(sameSite)
				c.SetCookie(
					"auth_session",
					newSession.Token,
					maxAge,
					"/",
					"",
					isSecure,
					true,
				)

				// Update session di context juga
				c.Set("session", *newSession)
			}
		}

		c.Next()
	}
}
