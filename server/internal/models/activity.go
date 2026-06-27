package models

import "time"

type ActivityMetadata struct {
	Score    *int     `bson:"score,omitempty" json:"score,omitempty"`
	TxHash   *string  `bson:"txHash,omitempty" json:"txHash,omitempty"`
	FileName *string  `bson:"fileName,omitempty" json:"fileName,omitempty"`
	Skills   []string `bson:"skills,omitempty" json:"skills,omitempty"`
	Progress *string  `bson:"progress,omitempty" json:"progress,omitempty"`
}

type Activity struct {
	ID          string            `bson:"_id" json:"id"`
	UserID      string            `bson:"userId" json:"userId"`
	Type        string            `bson:"type" json:"type"`
	Title       string            `bson:"title" json:"title"`
	Description string            `bson:"description" json:"description"`
	Date        string            `bson:"date" json:"date"`
	Time        string            `bson:"time" json:"time"`
	Metadata    *ActivityMetadata `bson:"metadata,omitempty" json:"metadata,omitempty"`
	CreatedAt   time.Time         `bson:"createdAt" json:"createdAt"`
}
