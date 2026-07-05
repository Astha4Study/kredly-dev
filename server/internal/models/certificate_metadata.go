package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CertificateMetadata stores certificate PDF and blockchain metadata
type CertificateMetadata struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SessionID      string             `bson:"session_id" json:"sessionId"`
	CertificateID  string             `bson:"certificate_id" json:"certificateId"`
	UserID         string             `bson:"user_id" json:"userId"`
	RecipientName  string             `bson:"recipient_name" json:"recipientName"`
	AssessmentName string             `bson:"assessment_name" json:"assessmentName"`
	Score          int                `bson:"score" json:"score"`
	PdfHash        string             `bson:"pdf_hash" json:"pdfHash"`
	IpfsCID        string             `bson:"ipfs_cid" json:"ipfsCID"`
	IpfsURL        string             `bson:"ipfs_url" json:"ipfsURL"`
	TxHash         string             `bson:"tx_hash" json:"txHash"`
	CreatedAt      time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updatedAt"`
}

// TableName returns the collection name
func (CertificateMetadata) TableName() string {
	return "certificate_metadata"
}
