package models

import (
	"time"
)

type Session struct {
	ID              string           `json:"id"`
	UserID          string           `json:"user_id"`
	Role            string           `json:"role"`
	Level           string           `json:"level"`
	Skills          []string         `json:"skills"`
	CVSummary       string           `json:"cv_summary"`
	ThetaCurrent    float64          `json:"theta_current"` // Current ability estimate (θ)
	ThetaInit       float64          `json:"theta_init"`    // Initial theta
	TotalItems      int              `json:"total_items"`   // Total items answered
	MaxItems        int              `json:"max_items"`     // Maximum items allowed
	MinItems        int              `json:"min_items"`     // Minimum items required
	SEMThreshold    float64          `json:"sem_threshold"` // SEM threshold for stopping
	Completed       bool             `json:"completed"`     // Exam finished?
	StopReason      string           `json:"stop_reason"`   // Why exam stopped
	PrefetchedItems []*PendingItem   `json:"prefetched_items"`
	PendingItem     *PendingItem     `json:"pending_item"`
	SeenItemIDs     []string         `json:"seen_item_ids"`
	SeenTopics      []string         `json:"seen_topics"`
	History         []AnswerHistory  `json:"history"`
	CreatedAt       time.Time        `json:"created_at"`
}

type PendingItem struct {
	ID           string   `json:"id"`
	Topic        string   `json:"topic"`
	Pertanyaan   string   `json:"pertanyaan"` // Question text
	Pilihan      []string `json:"pilihan"`    // Multiple choice options
	KunciJawaban string   `json:"-"`          // Correct answer key (hidden from json responses)
	Penjelasan   string   `json:"penjelasan"` // Explanation
	BEstimated   float64  `json:"b_estimated"` // Item difficulty (b-parameter)
}

type AnswerHistory struct {
	ItemID     string  `json:"item_id"`
	Topic      string  `json:"topic"`
	Answer     string  `json:"answer"`
	Correct    bool    `json:"correct"`
	ThetaAfter float64 `json:"theta_after"`
	BParam     float64 `json:"b_param"`
}
