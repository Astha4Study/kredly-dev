package service

import (
	"context"
	"kredly/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CertificateMetadataService struct {
	collection *mongo.Collection
}

func NewCertificateMetadataService(db *mongo.Database) *CertificateMetadataService {
	return &CertificateMetadataService{
		collection: db.Collection("certificate_metadata"),
	}
}

// GetBySessionID retrieves certificate metadata by session ID
func (s *CertificateMetadataService) GetBySessionID(sessionID string) (*models.CertificateMetadata, error) {
	var metadata models.CertificateMetadata
	err := s.collection.FindOne(context.Background(), bson.M{"session_id": sessionID}).Decode(&metadata)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Not found, not an error
		}
		return nil, err
	}
	return &metadata, nil
}

// GetByCertificateID retrieves certificate metadata by certificate ID
func (s *CertificateMetadataService) GetByCertificateID(certificateID string) (*models.CertificateMetadata, error) {
	var metadata models.CertificateMetadata
	err := s.collection.FindOne(context.Background(), bson.M{"certificate_id": certificateID}).Decode(&metadata)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Not found, not an error
		}
		return nil, err
	}
	return &metadata, nil
}

// GetByPdfHash retrieves certificate metadata by PDF hash
func (s *CertificateMetadataService) GetByPdfHash(pdfHash string) (*models.CertificateMetadata, error) {
	var metadata models.CertificateMetadata
	err := s.collection.FindOne(context.Background(), bson.M{"pdf_hash": pdfHash}).Decode(&metadata)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Not found, not an error
		}
		return nil, err
	}
	return &metadata, nil
}

// Save creates or updates certificate metadata
func (s *CertificateMetadataService) Save(metadata *models.CertificateMetadata) error {
	now := time.Now()

	if metadata.ID.IsZero() {
		// Create new
		metadata.ID = primitive.NewObjectID()
		metadata.CreatedAt = now
		metadata.UpdatedAt = now

		_, err := s.collection.InsertOne(context.Background(), metadata)
		return err
	}

	// Update existing
	metadata.UpdatedAt = now
	filter := bson.M{"_id": metadata.ID}
	update := bson.M{"$set": metadata}

	_, err := s.collection.UpdateOne(context.Background(), filter, update)
	return err
}
