package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"kredly/internal/config"
	"kredly/internal/database"
	"kredly/internal/models"
	"kredly/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthHandler struct {
	authService  *service.AuthService
	emailService *service.EmailService
	oauthConfig  *oauth2.Config
	config       *config.Config
}

func NewAuthHandler(authService *service.AuthService, emailService *service.EmailService, cfg *config.Config) *AuthHandler {
	// GOOGLE_OAUTH_REDIRECT_URL diambil dari API_URL + path callback
	redirectURL := cfg.APIURL + "/api/auth/callback/google"

	// Setup Google OAuth Config
	conf := &oauth2.Config{
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &AuthHandler{
		authService:  authService,
		emailService: emailService,
		oauthConfig:  conf,
		config:       cfg,
	}
}

// 1. Redirect User ke halaman Login Google
func (h *AuthHandler) HandleGoogleLogin(c *gin.Context) {
	// Generate random state untuk keamanan CSRF
	stateBytes := make([]byte, 16)
	rand.Read(stateBytes)
	state := hex.EncodeToString(stateBytes)

	// Simpan state di cookie untuk validasi nanti
	isSecure := h.config.Environment == "production"
	c.SetCookie("oauth_state", state, 300, "/", "", isSecure, true) // 5 menit

	url := h.oauthConfig.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// 2. Callback dari Google setelah User login
func (h *AuthHandler) HandleGoogleCallback(c *gin.Context) {
	// Validasi state untuk mencegah CSRF
	state := c.Query("state")
	savedState, err := c.Cookie("oauth_state")
	if err != nil || state == "" || state != savedState {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state parameter"})
		return
	}

	// Hapus state cookie setelah digunakan
	isSecure := h.config.Environment == "production"
	c.SetCookie("oauth_state", "", -1, "/", "", isSecure, true)

	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found"})
		return
	}

	// Tukar code dengan token Google
	token, err := h.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	// Ambil data profil User dari API Google
	client := h.oauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
		return
	}

	// Masukkan ke DB (User & Account)
	user, err := h.authService.HandleGoogleUser(c.Request.Context(), googleUser.Email, googleUser.Name, googleUser.Picture, googleUser.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Buat Sesi Kredly Anda sendiri
	session, err := h.authService.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// SET KUNCI KEAMANAN DI SINI (HttpOnly Cookie)
	// maxAge dalam detik (7 Hari)
	maxAge := 7 * 24 * 60 * 60
	isSecure = h.config.Environment == "production" // Wajib true di HTTPS (Production)

	// Set SameSite=Lax untuk development (proxy Vite), Strict untuk production
	sameSite := http.SameSiteLaxMode
	if isSecure {
		sameSite = http.SameSiteStrictMode
	}

	c.SetSameSite(sameSite)
	c.SetCookie(
		"auth_session", // nama cookie
		session.Token,  // value
		maxAge,
		"/",      // path berlaku (seluruh aplikasi)
		"",       // domain (kosongkan agar mengikuti host asal)
		isSecure, // Secure: hanya kirim via HTTPS
		true,     // HttpOnly: JavaScript (Frontend) TIDAK BISA membaca cookie ini
	)

	// Cek apakah user sudah melengkapi onboarding
	userProfileColl := database.DB.Collection("userProfile")
	var userProfile models.UserProfile
	err = userProfileColl.FindOne(c.Request.Context(), bson.M{"userId": user.ID}).Decode(&userProfile)

	// Get frontend URL from env, default to localhost:3000 for development
	frontendURL := h.config.FrontendURL

	// Redirect ke onboarding jika belum selesai, atau ke /app jika sudah
	if err != nil {
		// UserProfile tidak ditemukan, redirect ke onboarding
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/onboarding")
	} else {
		// UserProfile ditemukan, redirect ke /app
		c.Redirect(http.StatusTemporaryRedirect, frontendURL+"/app")
	}
}

// 3. Get Me (Menggunakan data dari middleware/cookie validation)
func (h *AuthHandler) HandleMe(c *gin.Context) {
	// Cek apakah sudah ada user dari middleware
	if user, exists := c.Get("user"); exists {
		// User sudah divalidasi dan di-refresh oleh middleware
		c.JSON(http.StatusOK, gin.H{"user": user})
		return
	}

	// Jika tidak ada middleware, lakukan validasi manual
	token, err := c.Cookie("auth_session")
	if err != nil || token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	sessionColl := database.DB.Collection("session")
	userColl := database.DB.Collection("user")
	userProfileColl := database.DB.Collection("userProfile")

	// Cari sesi di DB
	var session models.ASession
	err = sessionColl.FindOne(c.Request.Context(), bson.M{"token": token}).Decode(&session)
	if err != nil || session.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
		return
	}

	// Cari user yang memiliki sesi ini
	var user models.User
	err = userColl.FindOne(c.Request.Context(), bson.M{"_id": session.UserID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Cek apakah user sudah melengkapi onboarding
	var userProfile models.UserProfile
	hasCompletedOnboarding := false
	err = userProfileColl.FindOne(c.Request.Context(), bson.M{"userId": user.ID}).Decode(&userProfile)
	if err == nil {
		// UserProfile ditemukan, berarti sudah onboarding
		hasCompletedOnboarding = true
	}

	var cvRole *string
	var cvLevel *string
	var cvSkills []string
	var cvSummary *string

	if hasCompletedOnboarding {
		cvRole = userProfile.CVRole
		cvLevel = userProfile.CVLevel
		cvSkills = userProfile.CVSkills
		cvSummary = userProfile.CVSummary
	} else {
		cvRole = user.CVRole
		cvLevel = user.CVLevel
		cvSkills = user.CVSkills
		cvSummary = user.CVSummary
	}

	// Auto-refresh token jika mendekati expired (2 hari sebelum habis)
	if h.authService.ShouldRefreshSession(session.ExpiresAt) {
		newSession, err := h.authService.RefreshSession(c.Request.Context(), token, user.ID)
		if err == nil {
			// Update cookie dengan token baru
			maxAge := 7 * 24 * 60 * 60
			isSecure := h.config.Environment == "production"
			sameSite := http.SameSiteLaxMode
			if isSecure {
				sameSite = http.SameSiteStrictMode
			}

			c.SetSameSite(sameSite)
			c.SetCookie(
				"auth_session",
				newSession.Token,
				maxAge,
				"/",
				"",
				isSecure,
				true,
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":                     user.ID,
			"email":                  user.Email,
			"name":                   user.Name,
			"username":               user.Username,
			"emailVerified":          user.EmailVerified,
			"image":                  user.Image,
			"hasCompletedOnboarding": hasCompletedOnboarding,
			"cvRole":                 cvRole,
			"cvLevel":                cvLevel,
			"cvSkills":               cvSkills,
			"cvSummary":              cvSummary,
		},
	})
}

// 4. Logout
func (h *AuthHandler) HandleLogout(c *gin.Context) {
	token, err := c.Cookie("auth_session")
	if err == nil && token != "" {
		// Hapus dari Database agar token tidak bisa dipakai ulang meskipun dicuri
		database.DB.Collection("session").DeleteOne(c.Request.Context(), bson.M{"token": token})
	}

	// Timpa cookie lama dengan maxAge -1 untuk menghapusnya dari browser
	isSecure := h.config.Environment == "production"
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("auth_session", "", -1, "/", "", isSecure, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// 5. Send Email OTP
func (h *AuthHandler) HandleSendEmailOTP(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
		Type  string `json:"type"` // "sign-in" or "sign-up"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email wajib diisi"})
		return
	}

	// Kirim OTP via email
	err := h.emailService.SendOTP(c.Request.Context(), req.Email, req.Type)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal mengirim OTP",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "OTP berhasil dikirim",
	})
}

// 6. Verify Email OTP and Login
func (h *AuthHandler) HandleVerifyEmailOTP(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
		OTP   string `json:"otp" binding:"required"`
		Type  string `json:"type"` // "sign-in" or "sign-up"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email dan OTP wajib diisi"})
		return
	}

	// Verifikasi OTP
	_, err := h.emailService.VerifyOTP(c.Request.Context(), req.Email, req.OTP)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Kode OTP tidak valid atau sudah kadaluarsa",
		})
		return
	}

	userColl := database.DB.Collection("user")

	// Cari user berdasarkan email
	var user models.User
	err = userColl.FindOne(c.Request.Context(), bson.M{"email": req.Email}).Decode(&user)

	// Jika user tidak ditemukan dan type adalah sign-up, buat user baru
	if err != nil {
		if req.Type == "sign-up" {
			now := time.Now()
			user = models.User{
				ID:            uuid.New().String(),
				Email:         req.Email,
				EmailVerified: true,
				Name:          req.Email[:strings.Index(req.Email, "@")], // nama dari email
				CreatedAt:     now,
				UpdatedAt:     now,
			}

			_, err = userColl.InsertOne(c.Request.Context(), user)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Gagal membuat user",
				})
				return
			}
		} else {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User tidak ditemukan",
			})
			return
		}
	}

	// Buat session
	session, err := h.authService.CreateSession(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Gagal membuat session",
		})
		return
	}

	// Set cookie
	maxAge := 7 * 24 * 60 * 60
	isSecure := h.config.Environment == "production"
	sameSite := http.SameSiteLaxMode
	if isSecure {
		sameSite = http.SameSiteStrictMode
	}

	c.SetSameSite(sameSite)
	c.SetCookie(
		"auth_session",
		session.Token,
		maxAge,
		"/",
		"",
		isSecure,
		true,
	)

	// Cek apakah user sudah melengkapi onboarding
	userProfileColl := database.DB.Collection("userProfile")
	var userProfile models.UserProfile
	hasCompletedOnboarding := false
	err = userProfileColl.FindOne(c.Request.Context(), bson.M{"userId": user.ID}).Decode(&userProfile)
	if err == nil {
		hasCompletedOnboarding = true
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Verifikasi berhasil",
		"user": gin.H{
			"id":                     user.ID,
			"email":                  user.Email,
			"name":                   user.Name,
			"emailVerified":          user.EmailVerified,
			"hasCompletedOnboarding": hasCompletedOnboarding,
		},
	})
}
