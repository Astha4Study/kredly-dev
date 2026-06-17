package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"kredly/internal/groq"
	"kredly/internal/models"
	"kredly/internal/store"

	"github.com/google/uuid"
)

type CATService struct {
	sessions *store.SessionStore
	groq     *groq.Client
}

func NewCATService(sessions *store.SessionStore, groqClient *groq.Client) *CATService {
	return &CATService{
		sessions: sessions,
		groq:     groqClient,
	}
}

type CreateSessionReq struct {
	Role      string   `json:"role"`
	Level     string   `json:"level"`
	Skills    []string `json:"skills"`
	CVSummary string   `json:"cv_summary"`
}

type AnswerResult struct {
	Correct        bool    `json:"correct"`
	CorrectAnswer  string  `json:"correct_answer"` // The correct option key (A/B/C/D)
	Explanation    string  `json:"explanation"`
	StopReason     string  `json:"stop_reason"`
	ThetaNew       float64 `json:"theta_new"`
	Completed      bool    `json:"completed"`
	QuestionNumber int     `json:"question_number"`
}

type SessionResult struct {
	Score           int      `json:"score"`
	Theta           float64  `json:"theta"`
	Level           string   `json:"level"`
	Percentile      int      `json:"percentile"`
	Feedback        string   `json:"feedback"`
	Strengths       []string `json:"strengths"`
	Weaknesses      []string `json:"weaknesses"`
	Recommendations []string `json:"recommendations"`
	VerificationID  string   `json:"verification_id"`
	Role            string   `json:"role"`
	TotalItems      int      `json:"total_items"`
}

// CreateSession initializes a new adaptive test session
func (s *CATService) CreateSession(req CreateSessionReq) (*models.Session, error) {
	if !ValidateRole(req.Role) {
		return nil, fmt.Errorf("role '%s' is not supported", req.Role)
	}

	sessionID := uuid.New().String()
	sess := &models.Session{
		ID:              sessionID,
		Role:            req.Role,
		Level:           req.Level,
		Skills:          req.Skills,
		CVSummary:       req.CVSummary,
		ThetaCurrent:    0.0,
		ThetaInit:       0.0,
		MaxItems:        30,
		MinItems:        10,
		SEMThreshold:    0.3,
		Completed:       false,
		PrefetchedItems: make([]*models.PendingItem, 0),
		SeenItemIDs:     make([]string, 0),
		SeenTopics:      make([]string, 0),
		History:         make([]models.AnswerHistory, 0),
		CreatedAt:       time.Now(),
	}

	if err := s.sessions.Set(sess); err != nil {
		return nil, fmt.Errorf("failed to save session to database: %w", err)
	}

	// Async prefetch first batch of questions
	go s.triggerBackgroundPrefetch(sess.ID)

	return sess, nil
}

// NextItem retrieves the next question, either from the prefetch queue or synchronously
func (s *CATService) NextItem(ctx context.Context, sessionID string) (*models.PendingItem, int, error) {
	sess, err := s.sessions.Get(sessionID)
	if err != nil {
		return nil, 0, err
	}

	if sess.Completed {
		return nil, 0, errors.New("session already completed")
	}

	// Idempotency: if candidate is already viewing a pending question, return it
	if sess.PendingItem != nil {
		return sess.PendingItem, sess.TotalItems + 1, nil
	}

	var item *models.PendingItem
	var qNum int

	// Fast path: Take from prefetch queue
	err = s.sessions.Update(sessionID, func(sess *models.Session) {
		if sess.Completed {
			return
		}
		if len(sess.PrefetchedItems) > 0 {
			item = sess.PrefetchedItems[0]
			sess.PrefetchedItems = sess.PrefetchedItems[1:]
			sess.PendingItem = item
			sess.SeenItemIDs = append(sess.SeenItemIDs, item.ID)
			sess.SeenTopics = append(sess.SeenTopics, item.Topic)
			qNum = sess.TotalItems + 1
		}
	})
	if err != nil {
		return nil, 0, err
	}

	// If successfully got item from queue
	if item != nil {
		// Trigger prefetch to refill if queue is getting low
		go s.triggerBackgroundPrefetch(sessionID)
		return item, qNum, nil
	}

	// Slow path: Sync generate since queue was empty
	topic := PickTopic(sess.Role, sess.Skills, sess.SeenTopics)
	log.Printf("[CAT] Prefetch queue empty for session %s. Generating sync batch for topic: %s\n", sessionID, topic)

	generated, err := s.groq.GenerateItemBatch(ctx, groq.GenerateItemBatchRequest{
		Theta:     sess.ThetaCurrent,
		CVSummary: sess.CVSummary,
		Topic:     topic,
		BatchSize: 3,
		Role:      sess.Role,
		Skills:    sess.Skills,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to generate items sync: %w", err)
	}

	var pendingItems []*models.PendingItem
	for _, g := range generated {
		pendingItems = append(pendingItems, &models.PendingItem{
			ID:           uuid.New().String(),
			Topic:        topic,
			Pertanyaan:   g.Pertanyaan,
			Pilihan:      g.Pilihan,
			KunciJawaban: g.KunciJawaban,
			Penjelasan:   g.Penjelasan,
			BEstimated:   g.BEstimated,
		})
	}

	err = s.sessions.Update(sessionID, func(sess *models.Session) {
		if len(pendingItems) > 0 {
			item = pendingItems[0]
			sess.PendingItem = item
			sess.SeenItemIDs = append(sess.SeenItemIDs, item.ID)
			sess.SeenTopics = append(sess.SeenTopics, item.Topic)
			qNum = sess.TotalItems + 1

			// Store the rest in prefetch
			if len(pendingItems) > 1 {
				sess.PrefetchedItems = append(sess.PrefetchedItems, pendingItems[1:]...)
			}
		}
	})
	if err != nil {
		return nil, 0, err
	}

	if item == nil {
		return nil, 0, errors.New("no items were generated")
	}

	return item, qNum, nil
}

// SubmitAnswer evaluates candidate's answer, updates theta, SEM, and checks stopping conditions
func (s *CATService) SubmitAnswer(ctx context.Context, sessionID, answer string) (*AnswerResult, error) {
	sess, err := s.sessions.Get(sessionID)
	if err != nil {
		return nil, err
	}

	if sess.Completed {
		return nil, errors.New("session already completed")
	}

	if sess.PendingItem == nil {
		return nil, errors.New("no active pending question to answer")
	}

	userAns := strings.ToUpper(strings.TrimSpace(answer))
	correctAns := strings.ToUpper(strings.TrimSpace(sess.PendingItem.KunciJawaban))
	correct := userAns == correctAns

	thetaNew := UpdateTheta(sess.ThetaCurrent, sess.PendingItem.BEstimated, correct)

	historyItem := models.AnswerHistory{
		ItemID:     sess.PendingItem.ID,
		Topic:      sess.PendingItem.Topic,
		Answer:     userAns,
		Correct:    correct,
		ThetaAfter: thetaNew,
		BParam:     sess.PendingItem.BEstimated,
	}

	newHistory := append(sess.History, historyItem)
	semVal := SEM(thetaNew, newHistory)
	stopReason := ShouldStop(len(newHistory), semVal, sess.MaxItems, sess.MinItems, sess.SEMThreshold)
	completed := stopReason != ""

	var result AnswerResult
	explanation := sess.PendingItem.Penjelasan
	correctAnswer := sess.PendingItem.KunciJawaban

	err = s.sessions.Update(sessionID, func(sess *models.Session) {
		sess.ThetaCurrent = thetaNew
		sess.History = newHistory
		sess.TotalItems = len(newHistory)
		sess.PendingItem = nil // Clear active question
		if completed {
			sess.Completed = true
			sess.StopReason = stopReason
		}

		result = AnswerResult{
			Correct:        correct,
			CorrectAnswer:  correctAnswer,
			Explanation:    explanation,
			StopReason:     stopReason,
			ThetaNew:       thetaNew,
			Completed:      completed,
			QuestionNumber: sess.TotalItems,
		}
	})
	if err != nil {
		return nil, err
	}

	// Trigger prefetch if exam is not completed and queue is low
	if !completed {
		go s.triggerBackgroundPrefetch(sessionID)
	}

	return &result, nil
}

// GetResult retrieves the final statistics and generates AI career feedback
func (s *CATService) GetResult(ctx context.Context, sessionID string) (*SessionResult, error) {
	sess, err := s.sessions.Get(sessionID)
	if err != nil {
		return nil, err
	}

	if !sess.Completed {
		// Force completion if requested and min items met
		if sess.TotalItems >= sess.MinItems {
			err = s.sessions.Update(sessionID, func(s *models.Session) {
				s.Completed = true
				s.StopReason = "force_completed"
			})
			if err != nil {
				return nil, err
			}
			sess, _ = s.sessions.Get(sessionID)
		} else {
			return nil, fmt.Errorf("session not completed yet (answered %d/%d)", sess.TotalItems, sess.MinItems)
		}
	}

	score := ThetaToScore(sess.ThetaCurrent)
	level := ThetaToLevel(sess.ThetaCurrent)
	percentile := EstimatePercentile(sess.ThetaCurrent)

	// Convert history to evaluate payload format
	var historyItems []groq.EvaluateHistoryItem
	for _, h := range sess.History {
		historyItems = append(historyItems, groq.EvaluateHistoryItem{
			Topic:   h.Topic,
			Correct: h.Correct,
		})
	}

	evalReq := groq.EvaluateRequest{
		Role:       sess.Role,
		Skills:     sess.Skills,
		ThetaFinal: sess.ThetaCurrent,
		Score:      score,
		Level:      level,
		History:    historyItems,
	}

	// 10 second timeout for AI evaluation
	evalCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	evalRes, err := s.groq.EvaluateSession(evalCtx, evalReq)
	if err != nil {
		log.Printf("[CAT] Groq evaluation failed, using fallback: %v\n", err)
		// Fallback feedback if Groq fails
		evalRes = &groq.EvaluateResponse{
			Feedback:        fmt.Sprintf("Anda telah menyelesaikan ujian untuk peran %s dengan tingkat keahlian %s.", sess.Role, level),
			Strengths:       []string{"Menyelesaikan ujian adaptif secara lengkap", "Menunjukkan kompetensi teknis dasar"},
			Weaknesses:      []string{"Beberapa topik memerlukan pemahaman lebih lanjut"},
			Recommendations: []string{"Pelajari kembali topik-topik yang belum terjawab dengan benar", "Tingkatkan praktik langsung"},
		}
	}

	return &SessionResult{
		Score:           score,
		Theta:           sess.ThetaCurrent,
		Level:           level,
		Percentile:      percentile,
		Feedback:        evalRes.Feedback,
		Strengths:       evalRes.Strengths,
		Weaknesses:      evalRes.Weaknesses,
		Recommendations: evalRes.Recommendations,
		VerificationID:  "CERT-" + strings.ToUpper(sessionID[:8]),
		Role:            sess.Role,
		TotalItems:      sess.TotalItems,
	}, nil
}

// triggerBackgroundPrefetch populates the prefetch queue in a background goroutine
func (s *CATService) triggerBackgroundPrefetch(sessionID string) {
	sess, err := s.sessions.Get(sessionID)
	if err != nil {
		return
	}

	if sess.Completed {
		return
	}

	// Limit queue size
	if len(sess.PrefetchedItems) >= 3 {
		return
	}

	topic := PickTopic(sess.Role, sess.Skills, sess.SeenTopics)
	log.Printf("[CAT] Prefetching batch of items for topic: %s\n", topic)

	// Call Groq API with 15s timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	generated, err := s.groq.GenerateItemBatch(ctx, groq.GenerateItemBatchRequest{
		Theta:     sess.ThetaCurrent,
		CVSummary: sess.CVSummary,
		Topic:     topic,
		BatchSize: 3,
		Role:      sess.Role,
		Skills:    sess.Skills,
	})
	if err != nil {
		log.Printf("[CAT] Failed to prefetch items: %v\n", err)
		return
	}

	var pendingItems []*models.PendingItem
	for _, g := range generated {
		pendingItems = append(pendingItems, &models.PendingItem{
			ID:           uuid.New().String(),
			Topic:        topic,
			Pertanyaan:   g.Pertanyaan,
			Pilihan:      g.Pilihan,
			KunciJawaban: g.KunciJawaban,
			Penjelasan:   g.Penjelasan,
			BEstimated:   g.BEstimated,
		})
	}

	err = s.sessions.Update(sessionID, func(sess *models.Session) {
		if sess.Completed {
			return
		}
		sess.PrefetchedItems = append(sess.PrefetchedItems, pendingItems...)
		log.Printf("[CAT] Prefetched %d questions for session %s (Queue size: %d)\n", len(pendingItems), sessionID, len(sess.PrefetchedItems))
	})
	if err != nil {
		log.Printf("[CAT] Failed to save prefetched items: %v\n", err)
	}
}
