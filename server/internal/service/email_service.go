package service

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"kredly/internal/config"
	"kredly/internal/database"
	"kredly/internal/models"

	"github.com/google/uuid"
	"github.com/resend/resend-go/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type EmailService struct {
	resendClient *resend.Client
	config       *config.Config
}

func NewEmailService(cfg *config.Config) *EmailService {
	client := resend.NewClient(cfg.ResendAPIKey)
	return &EmailService{
		resendClient: client,
		config:       cfg,
	}
}

// GenerateOTP membuat kode OTP 6 digit
func (s *EmailService) GenerateOTP() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(900000)+100000)
}

// SendOTP mengirim OTP ke email dan menyimpannya ke database
func (s *EmailService) SendOTP(ctx context.Context, email string, otpType string) error {
	verificationColl := database.DB.Collection("verification")

	// Generate OTP
	code := s.GenerateOTP()
	now := time.Now()

	// Simpan OTP ke database menggunakan model Verification
	verification := models.Verification{
		ID:         uuid.New().String(),
		Identifier: email,
		Value:      code,
		ExpiresAt:  now.Add(10 * time.Minute), // Berlaku 10 menit
		CreatedAt:  &now,
		UpdatedAt:  &now,
	}

	_, err := verificationColl.InsertOne(ctx, verification)
	if err != nil {
		return fmt.Errorf("failed to save OTP: %w", err)
	}

	// Tentukan text berdasarkan type
	actionText := "masuk"
	if otpType == "sign-up" {
		actionText = "mendaftar"
	}

	// Kirim email menggunakan Resend
	params := &resend.SendEmailRequest{
		From:    "Kredly <noreply@aguspriyanto.my.id>",
		To:      []string{email},
		Subject: "Kode OTP Kredly",
		Html: fmt.Sprintf(`
			<h2>Kode OTP Anda</h2>
			<p>Gunakan kode berikut untuk %s ke Kredly:</p>
			<h1 style="font-size: 32px; letter-spacing: 4px;">%s</h1>
			<p>Kode ini berlaku selama 10 menit.</p>
		`, actionText, code),
	}

	_, err = s.resendClient.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// VerifyOTP memverifikasi OTP dan mengembalikan true jika valid
func (s *EmailService) VerifyOTP(ctx context.Context, email string, code string) (*models.Verification, error) {
	verificationColl := database.DB.Collection("verification")

	// Cari OTP yang valid (belum expired)
	var verification models.Verification
	err := verificationColl.FindOne(ctx, bson.M{
		"identifier": email,
		"value":      code,
		"expiresAt": bson.M{
			"$gt": time.Now(),
		},
	}, options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})).Decode(&verification)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("invalid or expired OTP")
		}
		return nil, err
	}

	// Hapus OTP setelah diverifikasi
	_, err = verificationColl.DeleteOne(ctx, bson.M{"_id": verification.ID})
	if err != nil {
		return nil, fmt.Errorf("failed to delete OTP: %w", err)
	}

	return &verification, nil
}
