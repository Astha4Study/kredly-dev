package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	Environment        string
	GroqAPIKey         string
	GroqBaseURL        string
	DatabaseURL        string
	APIURL             string
	FrontendURL        string
	GoogleClientID     string
	GoogleClientSecret string
	ResendAPIKey       string
}

func LoadConfig() *Config {
	// Try loading from .env, but don't fail if it doesn't exist (useful for production environments)
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found, relying on system environment variables")
	}

	port := getEnv("PORT", "8080")
	env := getEnv("ENVIRONMENT", "development")
	groqAPIKey := getEnv("GROQ_API_KEY", "")
	groqBaseURL := getEnv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
	databaseURL := getEnv("DATABASE_URL", "mongodb://localhost:27017/kredly")
	apiURL := getEnv("API_URL", "http://localhost:8080")
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:3000")
	googleClientID := getEnv("GOOGLE_CLIENT_ID", "")
	googleClientSecret := getEnv("GOOGLE_CLIENT_SECRET", "")
	resendAPIKey := getEnv("RESEND_API_KEY", "")

	if groqAPIKey == "" || groqAPIKey == "gsk_your_api_key_here" {
		log.Println("Warning: GROQ_API_KEY is not set or still set to default placeholder value. Please update it in your .env file.")
	}

	return &Config{
		Port:               port,
		Environment:        env,
		GroqAPIKey:         groqAPIKey,
		GroqBaseURL:        groqBaseURL,
		DatabaseURL:        databaseURL,
		APIURL:             apiURL,
		FrontendURL:        frontendURL,
		GoogleClientID:     googleClientID,
		GoogleClientSecret: googleClientSecret,
		ResendAPIKey:       resendAPIKey,
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
