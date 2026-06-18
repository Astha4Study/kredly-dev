package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"kredly/internal/config"
	"kredly/internal/database" // Tambahan import database
	"kredly/internal/groq"
	"kredly/internal/handlers"
	"kredly/internal/middleware" // Tambahan import middleware
	"kredly/internal/models"     // Tambahan import models
	"kredly/internal/service"
	"kredly/internal/store"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load Configurations
	cfg := config.LoadConfig()

	// ==========================================
	// INISIALISASI DATABASE
	// ==========================================
	database.ConnectDB(cfg.DatabaseURL)
	if err := models.SetupIndexes(database.DB); err != nil {
		log.Fatalf("Failed to setup database indexes: %v", err)
	}
	// ==========================================

	// 2. Initialize Groq API Client
	groqClient := groq.NewClient(cfg.GroqAPIKey, cfg.GroqBaseURL)

	// 3. Initialize CAT system
	sessionStore := store.NewSessionStore(database.DB)
	catService := service.NewCATService(sessionStore, groqClient)
	sessionHandler := handlers.NewSessionHandler(catService)

	// 4. Initialize Auth system
	authService := service.NewAuthService()
	emailService := service.NewEmailService(cfg)
	authHandler := handlers.NewAuthHandler(authService, emailService, cfg)

	// 5. Initialize Onboarding system
	onboardingHandler := handlers.NewOnboardingHandler()

	// 6. Initialize Profile system
	profileHandler := handlers.NewProfileHandler()

	// 7. Initialize HTTP Handlers
	cvHandler := handlers.NewCVHandler(groqClient)

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 6. Initialize Gin router
	r := gin.Default()

	// 7. Setup CORS Middleware
	r.Use(corsMiddleware())

	// 8. Define Routes
	// Detect jika deploy di Vercel, gunakan base path "/", jika tidak gunakan "/api"
	basePath := "/api"
	if os.Getenv("VERCEL") == "1" || os.Getenv("VERCEL_ENV") != "" {
		basePath = "/"
		log.Println("Running on Vercel, using base path: /")
	} else {
		log.Printf("Running locally, using base path: %s", basePath)
	}

	api := r.Group(basePath)
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":      "ok",
				"environment": cfg.Environment,
				"groq_loaded": cfg.GroqAPIKey != "",
			})
		})

		api.POST("/parse-cv", middleware.AuthMiddleware(cfg, authService), cvHandler.HandleParseCV)

		// CAT Session endpoints
		api.POST("/sessions", sessionHandler.HandleCreateSession)
		api.GET("/sessions/:id/next-item", sessionHandler.HandleNextItem)
		api.POST("/sessions/:id/answer", sessionHandler.HandleSubmitAnswer)
		api.GET("/sessions/:id/result", sessionHandler.HandleGetResult)
		api.POST("/sessions/:id/abandon", sessionHandler.HandleAbandonSession)

		// Auth endpoints (Better Auth compatible format)
		auth := api.Group("/auth")
		{
			// 1. Social Sign In (Better Auth format: /sign-in/:provider)
			auth.GET("/sign-in/google", authHandler.HandleGoogleLogin)

			// 2. OAuth Callback (Better Auth format: /callback/:provider)
			auth.GET("/callback/google", authHandler.HandleGoogleCallback)

			// 3. Get Session / Get Me (Better Auth uses /get-session) - Protected with auto-refresh
			auth.GET("/get-session", middleware.AuthMiddleware(cfg, authService), authHandler.HandleMe)

			// 4. Logout (Better Auth uses /sign-out)
			auth.POST("/sign-out", authHandler.HandleLogout)

			// 5. Minta OTP ke Email (Better Auth format: /sign-in/email-otp)
			// Frontend mengirim: { "email": "user@example.com", "type": "sign-in" }
			auth.POST("/sign-in/email-otp", authHandler.HandleSendEmailOTP)

			// 6. Verifikasi OTP dan Login (Better Auth format: /verify/email-otp)
			// Frontend mengirim: { "email": "user@example.com", "otp": "123456", "type": "sign-in" }
			auth.POST("/verify/email-otp", authHandler.HandleVerifyEmailOTP)
		}

		// Onboarding endpoints - Protected
		onboarding := api.Group("/onboarding")
		onboarding.Use(middleware.AuthMiddleware(cfg, authService))
		{
			onboarding.POST("/complete", onboardingHandler.HandleCompleteOnboarding)
		}

		// Profile endpoints - Protected
		api.GET("/profile", middleware.AuthMiddleware(cfg, authService), profileHandler.HandleGetProfile)
	}

	// 9. Start Server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server is starting on %s in %s mode...\n", addr, cfg.Environment)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

// corsMiddleware handles CORS configuration for development and production
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Gunakan origin spesifik, bukan wildcard, karena menggunakan credentials
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "http://localhost:3000" // default untuk development
		}

		// Allow specific origin (bukan wildcard *)
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
