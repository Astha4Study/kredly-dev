package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"kredly/internal/database"
	"kredly/internal/groq"
	"kredly/internal/models"
	"kredly/internal/store"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
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
	Role         string   `json:"role"`
	Level        string   `json:"level"`
	Skills       []string `json:"skills"`
	CVSummary    string   `json:"cv_summary"`
	UserID       string   `json:"user_id"`
	AssessmentID string   `json:"assessment_id"`
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
	Feedback        string   `json:"feedback"`
	Strengths       []string `json:"strengths"`
	Weaknesses      []string `json:"weaknesses"`
	Recommendations []string `json:"recommendations"`
	VerificationID  string   `json:"verification_id"`
	Role            string   `json:"role"`
	TotalItems      int      `json:"total_items"`
}

// CreateSession initializes a new adaptive test session
func (s *CATService) CreateSession(ctx context.Context, req CreateSessionReq) (*models.Session, error) {
	if !ValidateRole(req.Role) {
		return nil, fmt.Errorf("role '%s' is not supported", req.Role)
	}

	maxItems := 30
	minItems := 10

	// Fetch dynamic question count from UserProfile if UserID is provided
	var resolvedAssessmentID string
	if req.UserID != "" {
		userProfileColl := database.DB.Collection("userProfile")
		var userProfile models.UserProfile
		err := userProfileColl.FindOne(ctx, bson.M{"userId": req.UserID}).Decode(&userProfile)
		if err == nil {
			found := false
			// 1. Try matching by AssessmentID if provided
			if req.AssessmentID != "" {
				for _, assessment := range userProfile.CVAssessments {
					if assessment.ID == req.AssessmentID {
						if assessment.QuestionCount > 0 {
							maxItems = assessment.QuestionCount
							found = true
							resolvedAssessmentID = assessment.ID
						}
						break
					}
				}
			}
			// 2. If not matched, try matching by Title (case-insensitive) or recommended general assessment
			if !found {
				for _, assessment := range userProfile.CVAssessments {
					if assessment.IsRecommended || assessment.Type == "general" || strings.EqualFold(assessment.Title, req.Role) {
						if assessment.QuestionCount > 0 {
							maxItems = assessment.QuestionCount
							found = true
							resolvedAssessmentID = assessment.ID
						}
						break
					}
				}
			}
			// Ensure minItems doesn't exceed maxItems
			if minItems > maxItems {
				minItems = maxItems
			}
		} else {
			log.Printf("[CAT] Failed to fetch user profile for userId %s: %v\n", req.UserID, err)
		}
	}

	astID := req.AssessmentID
	if astID == "" {
		astID = resolvedAssessmentID
	}

	sessionID := uuid.New().String()
	sess := &models.Session{
		ID:              sessionID,
		UserID:          req.UserID,
		AssessmentID:    astID,
		Role:            req.Role,
		Level:           req.Level,
		Skills:          req.Skills,
		CVSummary:       req.CVSummary,
		ThetaCurrent:    0.0,
		ThetaInit:       0.0,
		MaxItems:        maxItems,
		MinItems:        minItems,
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
func (s *CATService) NextItem(ctx context.Context, sessionID string) (*models.PendingItem, int, int, int, error) {
	sess, err := s.sessions.Get(sessionID)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	if sess.Completed {
		return nil, 0, 0, 0, errors.New("session already completed")
	}

	// Idempotency: if candidate is already viewing a pending question, return it
	if sess.PendingItem != nil {
		return sess.PendingItem, sess.TotalItems + 1, sess.MaxItems, sess.MinItems, nil
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
		return nil, 0, 0, 0, err
	}

	// If successfully got item from queue
	if item != nil {
		// Trigger prefetch to refill if queue is getting low
		go s.triggerBackgroundPrefetch(sessionID)
		return item, qNum, sess.MaxItems, sess.MinItems, nil
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
		return nil, 0, 0, 0, fmt.Errorf("failed to generate items sync: %w", err)
	}

	var pendingItems []*models.PendingItem
	for _, g := range generated {
		qType := g.Type
		if qType == "" {
			qType = "multiple_choice"
		}
		pendingItems = append(pendingItems, &models.PendingItem{
			ID:           uuid.New().String(),
			Type:         qType,
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
		return nil, 0, 0, 0, err
	}

	if item == nil {
		return nil, 0, 0, 0, errors.New("no items were generated")
	}

	return item, qNum, sess.MaxItems, sess.MinItems, nil
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

	var correct bool
	var explanation string
	var correctAnswer string
	var savedAnswer string
	var score float64

	if sess.PendingItem.Type == "essay" {
		gradeRes, err := s.groq.GradeEssay(ctx, groq.EssayGradeRequest{
			Question:     sess.PendingItem.Pertanyaan,
			Rubric:       sess.PendingItem.KunciJawaban,
			UserResponse: answer,
		})
		if err != nil {
			log.Printf("[CAT] GradeEssay failed: %v\n", err)
			correct = true
			score = 1.0
			explanation = fmt.Sprintf("Evaluasi AI tertunda. Contoh Jawaban Acuan:\n%s", sess.PendingItem.Penjelasan)
		} else {
			score = float64(gradeRes.Score) / 100.0
			correct = score >= 0.6
			explanation = fmt.Sprintf("Skor Jawaban: %d/100. %s\n\n**Contoh Jawaban Acuan:**\n%s", gradeRes.Score, gradeRes.Explanation, sess.PendingItem.Penjelasan)
		}
		correctAnswer = "Sesuai Rubrik"
		savedAnswer = answer
	} else {
		userAns := strings.ToUpper(strings.TrimSpace(answer))
		correctAns := strings.ToUpper(strings.TrimSpace(sess.PendingItem.KunciJawaban))
		correct = userAns == correctAns
		if correct {
			score = 1.0
		} else {
			score = 0.0
		}
		explanation = sess.PendingItem.Penjelasan
		correctAnswer = sess.PendingItem.KunciJawaban
		savedAnswer = userAns
	}

	thetaNew := UpdateTheta(sess.ThetaCurrent, sess.PendingItem.BEstimated, score)

	historyItem := models.AnswerHistory{
		ItemID:     sess.PendingItem.ID,
		Topic:      sess.PendingItem.Topic,
		Answer:     savedAnswer,
		Type:       sess.PendingItem.Type,
		Correct:    correct,
		ThetaAfter: thetaNew,
		BParam:     sess.PendingItem.BEstimated,
	}

	newHistory := append(sess.History, historyItem)
	semVal := SEM(thetaNew, newHistory)
	stopReason := ShouldStop(len(newHistory), semVal, sess.MaxItems, sess.MinItems, sess.SEMThreshold)
	completed := stopReason != ""

	var result AnswerResult

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

	// 1. If result is already saved in the database, return it immediately
	if sess.Result != nil {
		return &SessionResult{
			Score:           sess.Result.Score,
			Theta:           sess.Result.Theta,
			Level:           sess.Result.Level,
			Feedback:        sess.Result.Feedback,
			Strengths:       sess.Result.Strengths,
			Weaknesses:      sess.Result.Weaknesses,
			Recommendations: sess.Result.Recommendations,
			VerificationID:  sess.Result.VerificationID,
			Role:            sess.Role,
			TotalItems:      sess.TotalItems,
		}, nil
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

	res := &SessionResult{
		Score:           score,
		Theta:           sess.ThetaCurrent,
		Level:           level,
		Feedback:        evalRes.Feedback,
		Strengths:       evalRes.Strengths,
		Weaknesses:      evalRes.Weaknesses,
		Recommendations: evalRes.Recommendations,
		VerificationID:  "CERT-" + strings.ToUpper(sessionID[:8]),
		Role:            sess.Role,
		TotalItems:      sess.TotalItems,
	}

	// 2. Persist the results inside the session document
	err = s.sessions.Update(sessionID, func(currentSess *models.Session) {
		currentSess.Result = &models.SessionResult{
			Score:           res.Score,
			Theta:           res.Theta,
			Level:           res.Level,
			Feedback:        res.Feedback,
			Strengths:       res.Strengths,
			Weaknesses:      res.Weaknesses,
			Recommendations: res.Recommendations,
			VerificationID:  res.VerificationID,
		}
	})
	if err != nil {
		log.Printf("[CAT] Failed to save result to session %s: %v\n", sessionID, err)
	}

	// 3. Update assessment status in UserProfile to "completed"
	if sess.UserID != "" && sess.AssessmentID != "" {
		go func() {
			userProfileColl := database.DB.Collection("userProfile")
			bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			filter := bson.M{
				"userId":           sess.UserID,
				"cvAssessments.id": sess.AssessmentID,
			}
			update := bson.M{
				"$set": bson.M{
					"cvAssessments.$.status": "completed",
				},
			}
			_, updateErr := userProfileColl.UpdateOne(bgCtx, filter, update)
			if updateErr != nil {
				log.Printf("[CAT] Failed to update assessment status in UserProfile: %v\n", updateErr)
			} else {
				log.Printf("[CAT] Assessment status updated to completed for user %s, assessment %s\n", sess.UserID, sess.AssessmentID)
			}
		}()
	}

	return res, nil
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
		qType := g.Type
		if qType == "" {
			qType = "multiple_choice"
		}
		pendingItems = append(pendingItems, &models.PendingItem{
			ID:           uuid.New().String(),
			Type:         qType,
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

// AbandonSession marks a session as completed with reason "abandoned"
func (s *CATService) AbandonSession(ctx context.Context, sessionID string) error {
	return s.sessions.Update(sessionID, func(sess *models.Session) {
		sess.Completed = true
		sess.StopReason = "abandoned"
	})
}

// GetSession retrieves the session state directly from the store
func (s *CATService) GetSession(ctx context.Context, sessionID string) (*models.Session, error) {
	return s.sessions.Get(sessionID)
}
