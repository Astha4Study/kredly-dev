package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"kredly/internal/database"
	"kredly/internal/models"
	"kredly/internal/service"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type SessionHandler struct {
	catService *service.CATService
}

func NewSessionHandler(catService *service.CATService) *SessionHandler {
	return &SessionHandler{
		catService: catService,
	}
}

type FilteredItem struct {
	ID         string   `json:"id"`
	Type       string   `json:"type"`
	Topic      string   `json:"topic"`
	Pertanyaan string   `json:"pertanyaan"`
	Pilihan    []string `json:"pilihan"`
}

type SubmitAnswerReq struct {
	Answer string `json:"answer" binding:"required"`
}

// HandleCreateSession POST /api/sessions
func (h *SessionHandler) HandleCreateSession(c *gin.Context) {
	var req service.CreateSessionReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	if req.Role == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role is required"})
		return
	}

	// Extract User ID from context if authenticated (set by AuthMiddleware)
	if userInterface, exists := c.Get("user"); exists {
		if userMap, ok := userInterface.(gin.H); ok {
			if userID, ok := userMap["id"].(string); ok {
				req.UserID = userID
			}
		}
	}

	sess, err := h.catService.CreateSession(c.Request.Context(), req)
	if err != nil {
		if err.Error() == "insufficient_tokens" {
			c.JSON(http.StatusPaymentRequired, gin.H{
				"error": "Saldo kredit Anda tidak mencukupi untuk memulai asesmen baru. Silakan top up kredit terlebih dahulu.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log assessment started activity
	if req.UserID != "" {
		assessmentName := req.Role
		if req.Level != "" {
			assessmentName = fmt.Sprintf("%s - %s", req.Role, req.Level)
		}

		models.LogActivityAsync(
			database.DB,
			req.UserID,
			models.ActivityAssessmentStarted,
			fmt.Sprintf("Memulai Assessment %s", req.Role),
			fmt.Sprintf("Anda telah memulai assessment untuk %s", assessmentName),
			&models.ActivityMetadata{
				Progress: strPtr(fmt.Sprintf("0/%d soal", sess.MaxItems)),
			},
		)
	}

	c.JSON(http.StatusCreated, gin.H{
		"session_id": sess.ID,
		"role":       sess.Role,
		"level":      sess.Level,
		"theta_init": sess.ThetaInit,
	})
}

// HandleNextItem GET /api/sessions/:id/next-item
func (h *SessionHandler) HandleNextItem(c *gin.Context) {
	sessionID := strings.TrimSpace(c.Param("id"))
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	// Check session exists and is still resumable before fetching next item
	sess, err := h.catService.GetSession(c.Request.Context(), sessionID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !h.catService.IsSessionResumable(sess) {
		c.JSON(http.StatusGone, gin.H{
			"error":   "session_expired",
			"message": "Waktu resume sesi habis. Silakan mulai assessment baru.",
		})
		return
	}

	item, qNum, maxItems, minItems, err := h.catService.NextItem(c.Request.Context(), sessionID)
	if err != nil {
		// Detect if session is already completed to return appropriate status
		if strings.Contains(err.Error(), "already completed") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "completed": true})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Filter item to hide KunciJawaban, Penjelasan, and BEstimated from frontend
	filtered := FilteredItem{
		ID:         item.ID,
		Type:       item.Type,
		Topic:      item.Topic,
		Pertanyaan: item.Pertanyaan,
		Pilihan:    item.Pilihan,
	}

	c.JSON(http.StatusOK, gin.H{
		"item":            filtered,
		"question_number": qNum,
		"max_questions":   maxItems,
		"min_questions":   minItems,
	})
}

// HandleSubmitAnswer POST /api/sessions/:id/answer
func (h *SessionHandler) HandleSubmitAnswer(c *gin.Context) {
	sessionID := strings.TrimSpace(c.Param("id"))
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	var req SubmitAnswerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body, 'answer' is required: " + err.Error()})
		return
	}

	result, err := h.catService.SubmitAnswer(c.Request.Context(), sessionID, req.Answer)
	if err != nil {
		if strings.Contains(err.Error(), "already completed") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "completed": true})
			return
		}
		// Double-submit guard: PendingItem was already cleared by a previous request.
		// Return 409 Conflict so the frontend can silently ignore or refresh state.
		if errors.Is(err, service.ErrNoPendingQuestion) {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Jawaban sudah dikirim sebelumnya. Silakan lanjut ke soal berikutnya.",
				"code":  "already_submitted",
			})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Log assessment completed activity when exam finishes
	if result.Completed {
		sess, err := h.catService.GetSession(c.Request.Context(), sessionID)
		if err == nil && sess.UserID != "" {
			// Get session result to log score
			sessionResult, err := h.catService.GetResult(c.Request.Context(), sessionID)
			if err == nil {
				assessmentName := sess.Role
				if sess.Level != "" {
					assessmentName = fmt.Sprintf("%s - %s", sess.Role, sess.Level)
				}

				score := sessionResult.Score
				passed := score >= 60 // Passing threshold

				models.LogActivityAsync(
					database.DB,
					sess.UserID,
					models.ActivityAssessmentCompleted,
					fmt.Sprintf("Menyelesaikan Assessment %s", sess.Role),
					fmt.Sprintf("Anda telah menyelesaikan assessment %s dengan skor %d/1000", assessmentName, score),
					&models.ActivityMetadata{
						Score:    &score,
						Progress: strPtr(fmt.Sprintf("%d/%d soal", sess.TotalItems, sess.MaxItems)),
					},
				)

				// Log credential earned if passed
				if passed {
					models.LogActivityAsync(
						database.DB,
						sess.UserID,
						models.ActivityCredentialEarned,
						fmt.Sprintf("Mendapatkan Kredensial %s", sess.Role),
						fmt.Sprintf("Selamat! Anda telah mendapatkan kredensial untuk %s dengan skor %d/100", assessmentName, score),
						&models.ActivityMetadata{
							Score: &score,
						},
					)
				}
			}
		}
	}

	c.JSON(http.StatusOK, result)
}

// HandleGetResult GET /api/sessions/:id/result
func (h *SessionHandler) HandleGetResult(c *gin.Context) {
	sessionID := strings.TrimSpace(c.Param("id"))
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	result, err := h.catService.GetResult(c.Request.Context(), sessionID)
	if err != nil {
		if strings.Contains(err.Error(), "not completed yet") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// HandleAbandonSession POST /api/sessions/:id/abandon
func (h *SessionHandler) HandleAbandonSession(c *gin.Context) {
	sessionID := strings.TrimSpace(c.Param("id"))
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	// Get session before abandoning to log activity
	sess, err := h.catService.GetSession(c.Request.Context(), sessionID)
	if err == nil && sess.UserID != "" {
		assessmentName := sess.Role
		if sess.Level != "" {
			assessmentName = fmt.Sprintf("%s - %s", sess.Role, sess.Level)
		}

		models.LogActivityAsync(
			database.DB,
			sess.UserID,
			models.ActivityAssessmentAbandoned,
			fmt.Sprintf("Membatalkan Assessment %s", sess.Role),
			fmt.Sprintf("Anda telah keluar dari assessment %s", assessmentName),
			&models.ActivityMetadata{
				Progress: strPtr(fmt.Sprintf("%d/%d soal", sess.TotalItems, sess.MaxItems)),
			},
		)
	}

	err = h.catService.AbandonSession(c.Request.Context(), sessionID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "session abandoned"})
}

// HandleGetSession GET /api/sessions/:id
func (h *SessionHandler) HandleGetSession(c *gin.Context) {
	sessionID := strings.TrimSpace(c.Param("id"))
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID is required"})
		return
	}

	sess, err := h.catService.GetSession(c.Request.Context(), sessionID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Resolve estimatedTime from the matching cvAssessment → convert to seconds
	estimatedTimeSeconds := 0
	if sess.AssessmentID != "" && sess.UserID != "" {
		userProfileColl := database.DB.Collection("userProfile")
		var userProfile models.UserProfile
		if findErr := userProfileColl.FindOne(c.Request.Context(), bson.M{"userId": sess.UserID}).Decode(&userProfile); findErr == nil {
			for _, a := range userProfile.CVAssessments {
				if a.ID == sess.AssessmentID {
					estimatedTimeSeconds = parseEstimatedTimeToSeconds(a.EstimatedTime)
					break
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                     sess.ID,
		"assessment_id":          sess.AssessmentID,
		"role":                   sess.Role,
		"level":                  sess.Level,
		"total_items":            sess.TotalItems,
		"max_items":              sess.MaxItems,
		"min_items":              sess.MinItems,
		"completed":              sess.Completed,
		"estimated_time_seconds": estimatedTimeSeconds,
		// Resume TTL fields
		"last_active_at": sess.LastActiveAt,
		"expires_at":     sess.ExpiresAt,
		"is_resumable":   h.catService.IsSessionResumable(sess),
	})
}

// parseEstimatedTimeToSeconds converts strings like "30 menit", "1 jam", "90 menit" to seconds.
// Returns 0 if the format is not recognised.
func parseEstimatedTimeToSeconds(s string) int {
	s = strings.ToLower(strings.TrimSpace(s))
	if s == "" {
		return 0
	}
	parts := strings.Fields(s)
	if len(parts) < 2 {
		return 0
	}
	n, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0
	}
	switch {
	case strings.HasPrefix(parts[1], "jam") || strings.HasPrefix(parts[1], "hour"):
		return n * 3600
	case strings.HasPrefix(parts[1], "menit") || strings.HasPrefix(parts[1], "min"):
		return n * 60
	case strings.HasPrefix(parts[1], "detik") || strings.HasPrefix(parts[1], "sec"):
		return n
	}
	return 0
}

// Helper function to create string pointer
func strPtr(s string) *string {
	return &s
}
