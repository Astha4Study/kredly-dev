package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"kredly/internal/database"
	"kredly/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

// HandleGoogleUser mengurus logika upsert User dan Account dari data Google
func (s *AuthService) HandleGoogleUser(ctx context.Context, email, name, picture, googleID string) (*models.User, error) {
	userColl := database.DB.Collection("user")
	accountColl := database.DB.Collection("account")

	var user models.User
	err := userColl.FindOne(ctx, bson.M{"email": email}).Decode(&user)

	now := time.Now()

	// Jika User belum ada, buat baru
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			user = models.User{
				ID:            uuid.New().String(),
				Name:          name,
				Email:         email,
				EmailVerified: true,
				Image:         &picture,
				TokenBalance:  &models.TokenBalance{Current: 50, TotalEarned: 50, TotalSpent: 0},
				CreatedAt:     now,
				UpdatedAt:     now,
			}
			_, err = userColl.InsertOne(ctx, user)
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	// Cek apakah Account (Google) sudah terhubung ke User ini
	var account models.Account
	err = accountColl.FindOne(ctx, bson.M{"providerId": "google", "accountId": googleID}).Decode(&account)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			account = models.Account{
				ID:         uuid.New().String(),
				AccountID:  googleID,
				ProviderID: "google",
				UserID:     user.ID,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			_, err = accountColl.InsertOne(ctx, account)
			if err != nil {
				return nil, err
			}
		}
	}

	return &user, nil
}

// CreateSession membuat token acak yang sangat aman dan menyimpannya ke DB
func (s *AuthService) CreateSession(ctx context.Context, userID string) (*models.ASession, error) {
	sessionColl := database.DB.Collection("session")

	// Generate 32-byte secure random token
	tokenBytes := make([]byte, 32)
	rand.Read(tokenBytes)
	token := hex.EncodeToString(tokenBytes)

	now := time.Now()
	// Sesi berlaku 7 Hari
	expiresAt := now.Add(7 * 24 * time.Hour)

	session := models.ASession{
		ID:        uuid.New().String(),
		Token:     token,
		UserID:    userID,
		ExpiresAt: expiresAt,
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err := sessionColl.InsertOne(ctx, session)
	if err != nil {
		return nil, err
	}

	return &session, nil
}

// RefreshSession memperpanjang session yang sudah ada dengan token baru
func (s *AuthService) RefreshSession(ctx context.Context, oldToken string, userID string) (*models.ASession, error) {
	sessionColl := database.DB.Collection("session")

	// Hapus session lama
	_, err := sessionColl.DeleteOne(ctx, bson.M{"token": oldToken})
	if err != nil {
		return nil, err
	}

	// Buat session baru dengan token baru
	return s.CreateSession(ctx, userID)
}

// ShouldRefreshSession mengecek apakah session perlu di-refresh (2 hari sebelum expired)
func (s *AuthService) ShouldRefreshSession(expiresAt time.Time) bool {
	// Refresh jika session akan expired dalam 2 hari
	refreshThreshold := time.Now().Add(2 * 24 * time.Hour)
	return expiresAt.Before(refreshThreshold)
}
