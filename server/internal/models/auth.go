package models

import (
	"context"
	"log"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ==========================================
// 1. DEFINISI STRUCT (MODEL DATABASE)
// ==========================================

type User struct {
	ID            string    `bson:"_id" json:"id"`
	Name          string    `bson:"name" json:"name"`
	Email         string    `bson:"email" json:"email"`
	EmailVerified bool      `bson:"emailVerified" json:"emailVerified"`
	Image         *string   `bson:"image,omitempty" json:"image,omitempty"`
	CreatedAt     time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time `bson:"updatedAt" json:"updatedAt"`

	// Relasi diabaikan di level database, hanya untuk JSON response jika diperlukan
	Sessions []Session `bson:"-" json:"sessions,omitempty"`
	Accounts []Account `bson:"-" json:"accounts,omitempty"`
}

type ASession struct {
	ID        string    `bson:"_id" json:"id"`
	ExpiresAt time.Time `bson:"expiresAt" json:"expiresAt"`
	Token     string    `bson:"token" json:"token"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
	IPAddress *string   `bson:"ipAddress,omitempty" json:"ipAddress,omitempty"`
	UserAgent *string   `bson:"userAgent,omitempty" json:"userAgent,omitempty"`
	UserID    string    `bson:"userId" json:"userId"`

	User *User `bson:"-" json:"user,omitempty"`
}

type Account struct {
	ID                    string     `bson:"_id" json:"id"`
	AccountID             string     `bson:"accountId" json:"accountId"`
	ProviderID            string     `bson:"providerId" json:"providerId"`
	UserID                string     `bson:"userId" json:"userId"`
	AccessToken           *string    `bson:"accessToken,omitempty" json:"accessToken,omitempty"`
	RefreshToken          *string    `bson:"refreshToken,omitempty" json:"refreshToken,omitempty"`
	IDToken               *string    `bson:"idToken,omitempty" json:"idToken,omitempty"`
	AccessTokenExpiresAt  *time.Time `bson:"accessTokenExpiresAt,omitempty" json:"accessTokenExpiresAt,omitempty"`
	RefreshTokenExpiresAt *time.Time `bson:"refreshTokenExpiresAt,omitempty" json:"refreshTokenExpiresAt,omitempty"`
	Scope                 *string    `bson:"scope,omitempty" json:"scope,omitempty"`
	Password              *string    `bson:"password,omitempty" json:"password,omitempty"`
	CreatedAt             time.Time  `bson:"createdAt" json:"createdAt"`
	UpdatedAt             time.Time  `bson:"updatedAt" json:"updatedAt"`

	User *User `bson:"-" json:"user,omitempty"`
}

type Verification struct {
	ID         string     `bson:"_id" json:"id"`
	Identifier string     `bson:"identifier" json:"identifier"`
	Value      string     `bson:"value" json:"value"`
	ExpiresAt  time.Time  `bson:"expiresAt" json:"expiresAt"`
	CreatedAt  *time.Time `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt  *time.Time `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

// ==========================================
// 2. SETUP UNIQUE INDEXES
// ==========================================

// SetupIndexes berfungsi mengeksekusi pembuatan index unik (pengganti @@unique di Prisma)
func SetupIndexes(db *mongo.Database) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Index unik untuk User (Email)
	userCollection := db.Collection("user")
	_, err := userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		// Cek apakah errornya karena index sudah ada (conflict)
		if strings.Contains(err.Error(), "IndexOptionsConflict") || strings.Contains(err.Error(), "already exists") {
			log.Println("⚠️ Index unik untuk User Email sudah ada, proses diabaikan.")
		} else {
			log.Printf("❌ Gagal membuat index unik untuk User Email: %v", err)
			return err
		}
	}

	// 2. Index unik untuk Session (Token)
	sessionCollection := db.Collection("session")
	_, err = sessionCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "token", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		// Cek apakah errornya karena index sudah ada (conflict)
		if strings.Contains(err.Error(), "IndexOptionsConflict") || strings.Contains(err.Error(), "already exists") {
			log.Println("⚠️ Index unik untuk Session Token sudah ada, proses diabaikan.")
		} else {
			log.Printf("❌ Gagal membuat index unik untuk Session Token: %v", err)
			return err
		}
	}

	log.Println("✅ Berhasil mensinkronisasi semua index MongoDB!")
	return nil
}
