package main

import (
	"fmt"
	"log"
	"net/http"

	"kredly/internal/config"
	"kredly/internal/groq"
	"kredly/internal/handlers"
	"kredly/internal/service"
	"kredly/internal/store"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load Configurations
	cfg := config.LoadConfig()

	// 2. Initialize Groq API Client
	groqClient := groq.NewClient(cfg.GroqAPIKey, cfg.GroqBaseURL)

	// 3. Initialize CAT system
	sessionStore := store.NewSessionStore()
	catService := service.NewCATService(sessionStore, groqClient)
	sessionHandler := handlers.NewSessionHandler(catService)

	// 4. Initialize HTTP Handlers
	cvHandler := handlers.NewCVHandler(groqClient)

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 5. Initialize Gin router
	r := gin.Default()

	// 6. Setup CORS Middleware
	r.Use(corsMiddleware())

	// 7. Define Routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":      "ok",
				"environment": cfg.Environment,
				"groq_loaded": cfg.GroqAPIKey != "",
			})
		})

		api.POST("/parse-cv", cvHandler.HandleParseCV)

		// CAT Session endpoints
		api.POST("/sessions", sessionHandler.HandleCreateSession)
		api.GET("/sessions/:id/next-item", sessionHandler.HandleNextItem)
		api.POST("/sessions/:id/answer", sessionHandler.HandleSubmitAnswer)
		api.GET("/sessions/:id/result", sessionHandler.HandleGetResult)
	}

	// 7. Start Server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server is starting on %s in %s mode...\n", addr, cfg.Environment)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

// corsMiddleware handles CORS configuration for development and production
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // For development; configure strictly in production
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
