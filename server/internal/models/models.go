package models

import (
	"time"
)

type SessionResult struct {
	Score           int      `bson:"score" json:"score"`
	Theta           float64  `bson:"theta" json:"theta"`
	Level           string   `bson:"level" json:"level"`
	Feedback        string   `bson:"feedback" json:"feedback"`
	Strengths       []string `bson:"strengths" json:"strengths"`
	Weaknesses      []string `bson:"weaknesses" json:"weaknesses"`
	Recommendations []string `bson:"recommendations" json:"recommendations"`
	VerificationID  string   `bson:"verificationId" json:"verification_id"`
}

type Session struct {
	ID              string          `bson:"_id" json:"id"`
	UserID          string          `bson:"userId" json:"user_id"`
	AssessmentID    string          `bson:"assessmentId,omitempty" json:"assessment_id,omitempty"`
	Role            string          `bson:"role" json:"role"`
	Level           string          `bson:"level" json:"level"`
	Skills          []string        `bson:"skills" json:"skills"`
	CVSummary       string          `bson:"cvSummary" json:"cv_summary"`
	ThetaCurrent    float64         `bson:"thetaCurrent" json:"theta_current"` // Current ability estimate (θ)
	ThetaInit       float64         `bson:"thetaInit" json:"theta_init"`       // Initial theta
	TotalItems      int             `bson:"totalItems" json:"total_items"`     // Total items answered
	MaxItems        int             `bson:"maxItems" json:"max_items"`         // Maximum items allowed
	MinItems        int             `bson:"minItems" json:"min_items"`         // Minimum items required
	SEMThreshold    float64         `bson:"semThreshold" json:"sem_threshold"` // SEM threshold for stopping
	Completed       bool            `bson:"completed" json:"completed"`        // Exam finished?
	StopReason      string          `bson:"stopReason" json:"stop_reason"`     // Why exam stopped
	PrefetchedItems []*PendingItem  `bson:"prefetchedItems" json:"prefetched_items"`
	PendingItem     *PendingItem    `bson:"pendingItem" json:"pending_item"`
	SeenItemIDs     []string        `bson:"seenItemIds" json:"seen_item_ids"`
	SeenTopics      []string        `bson:"seenTopics" json:"seen_topics"`
	History         []AnswerHistory `bson:"history" json:"history"`
	Result          *SessionResult  `bson:"result,omitempty" json:"result,omitempty"`
	Version         int64           `bson:"version" json:"version"` // Optimistic concurrency control version
	CreatedAt       time.Time       `bson:"createdAt" json:"created_at"`
	CompletedAt     *time.Time      `bson:"completedAt,omitempty" json:"completed_at,omitempty"`
	DurationSeconds int             `bson:"durationSeconds,omitempty" json:"duration_seconds,omitempty"`

	// Resume TTL fields
	// LastActiveAt is updated every time the user successfully submits an answer.
	// ExpiresAt is set to LastActiveAt + 24h (sliding window) and determines
	// how long an in-progress session can be resumed after the user exits.
	LastActiveAt *time.Time `bson:"lastActiveAt,omitempty" json:"last_active_at,omitempty"`
	ExpiresAt    time.Time  `bson:"expiresAt" json:"expires_at"`
}

type PendingItem struct {
	ID           string   `bson:"id" json:"id"`
	Type         string   `bson:"type" json:"type"` // "multiple_choice" atau "essay"
	Topic        string   `bson:"topic" json:"topic"`
	Pertanyaan   string   `bson:"pertanyaan" json:"pertanyaan"`  // Question text
	Pilihan      []string `bson:"pilihan" json:"pilihan"`        // Multiple choice options
	KunciJawaban string   `bson:"kunciJawaban" json:"-"`         // Correct answer key (hidden from json responses)
	Penjelasan   string   `bson:"penjelasan" json:"penjelasan"`  // Explanation
	BEstimated   float64  `bson:"bEstimated" json:"b_estimated"` // Item difficulty (b-parameter)
}

type AnswerHistory struct {
	ItemID     string  `bson:"itemId" json:"item_id"`
	Topic      string  `bson:"topic" json:"topic"`
	Answer     string  `bson:"answer" json:"answer"`
	Type       string  `bson:"type" json:"type"` // "multiple_choice" atau "essay"
	Correct    bool    `bson:"correct" json:"correct"`
	ThetaAfter float64 `bson:"thetaAfter" json:"theta_after"`
	BParam     float64 `bson:"bParam" json:"b_param"`
}
