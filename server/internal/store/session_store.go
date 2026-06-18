package store

import (
	"context"
	"errors"
	"time"

	"kredly/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type SessionStore struct {
	db *mongo.Database
}

func NewSessionStore(db *mongo.Database) *SessionStore {
	return &SessionStore{
		db: db,
	}
}

func (s *SessionStore) Set(sess *models.Session) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := s.db.Collection("cat_sessions")
	_, err := collection.InsertOne(ctx, sess)
	return err
}

func (s *SessionStore) Get(id string) (*models.Session, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := s.db.Collection("cat_sessions")
	var sess models.Session
	err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&sess)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("session not found")
		}
		return nil, err
	}
	return &sess, nil
}

func (s *SessionStore) Update(id string, fn func(*models.Session)) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := s.db.Collection("cat_sessions")

	// Optimistic concurrency control retry loop
	for retries := 0; retries < 10; retries++ {
		var sess models.Session
		err := collection.FindOne(ctx, bson.M{"_id": id}).Decode(&sess)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return errors.New("session not found")
			}
			return err
		}

		currentVersion := sess.Version
		fn(&sess)
		sess.Version = currentVersion + 1

		// Replace document matching both the ID and the old version
		res, err := collection.ReplaceOne(ctx, bson.M{"_id": id, "version": currentVersion}, &sess)
		if err != nil {
			return err
		}

		if res.ModifiedCount > 0 {
			return nil // Successful update
		}

		// Wait briefly before retrying
		time.Sleep(50 * time.Millisecond)
	}

	return errors.New("failed to update session after maximum retries due to concurrent updates")
}

func (s *SessionStore) Delete(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := s.db.Collection("cat_sessions")
	_, err := collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
