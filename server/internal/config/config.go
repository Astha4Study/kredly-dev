package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	GroqAPIKey  string
	GroqBaseURL string
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

	if groqAPIKey == "" || groqAPIKey == "gsk_your_api_key_here" {
		log.Println("Warning: GROQ_API_KEY is not set or still set to default placeholder value. Please update it in your .env file.")
	}

	return &Config{
		Port:        port,
		Environment: env,
		GroqAPIKey:  groqAPIKey,
		GroqBaseURL: groqBaseURL,
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
