package models

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/mongo"
)

// Activity Type Constants
const (
	// Auth
	ActivityUserLogin    = "user_login"
	ActivityUserLogout   = "user_logout"
	ActivityUserRegister = "user_register"

	// Onboarding & Profile
	ActivityOnboardingCompleted = "onboarding_completed"
	ActivityProfileUpdated      = "profile_updated"
	ActivityCVUploaded          = "cv_uploaded"
	ActivityCVParsed            = "cv_parsed"

	// Assessment
	ActivityCustomAssessmentCreated = "custom_assessment_created"
	ActivityAssessmentStarted       = "assessment_started"
	ActivityAssessmentCompleted     = "assessment_completed"
	ActivityAssessmentAbandoned     = "assessment_abandoned"

	// Certification
	ActivityCredentialEarned      = "credential_earned"
	ActivityCertificateDownloaded = "certificate_downloaded"
	ActivityBlockchainIssued      = "blockchain_issued"
	ActivityBlockchainVerified    = "blockchain_verified"

	// Payment
	ActivityTopupInitiated = "topup_initiated"
	ActivityTopupCompleted = "topup_completed"
	ActivityTopupFailed    = "topup_failed"
)

// LogActivity creates a new activity log entry in the database
func LogActivity(
	db *mongo.Database,
	userID string,
	activityType string,
	title string,
	description string,
	metadata *ActivityMetadata,
) error {
	if db == nil {
		return fmt.Errorf("database connection is nil")
	}

	if userID == "" {
		return fmt.Errorf("userID is required")
	}

	now := time.Now()

	// Format date and time in Indonesian locale style
	date := now.Format("2 January 2006")
	timeStr := now.Format("15:04")

	activity := Activity{
		ID:          uuid.New().String(),
		UserID:      userID,
		Type:        activityType,
		Title:       title,
		Description: description,
		Date:        date,
		Time:        timeStr,
		Metadata:    metadata,
		CreatedAt:   now,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := db.Collection("activity").InsertOne(ctx, activity)
	if err != nil {
		// Log error but don't block the main flow
		log.Printf("⚠️ Failed to log activity [%s] for user %s: %v", activityType, userID, err)
		return err
	}

	log.Printf("✅ Activity logged: [%s] %s for user %s", activityType, title, userID)
	return nil
}

// LogActivityAsync logs activity in a goroutine (fire-and-forget)
// Use this when you don't want to block the main flow
func LogActivityAsync(
	db *mongo.Database,
	userID string,
	activityType string,
	title string,
	description string,
	metadata *ActivityMetadata,
) {
	go func() {
		if err := LogActivity(db, userID, activityType, title, description, metadata); err != nil {
			log.Printf("⚠️ Async activity logging failed: %v", err)
		}
	}()
}
