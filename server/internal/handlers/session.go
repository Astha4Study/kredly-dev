package handlers

import (
	"net/http"
	"strings"

	"kredly/internal/service"

	"github.com/gin-gonic/gin"
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

	sess, err := h.catService.CreateSession(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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

	item, qNum, err := h.catService.NextItem(c.Request.Context(), sessionID)
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
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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

	err := h.catService.AbandonSession(c.Request.Context(), sessionID)
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
