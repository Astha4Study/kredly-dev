package store

import (
	"sync"
	"testing"
	"time"

	"kredly/internal/models"
)

func TestSessionStore_SetAndGet(t *testing.T) {
	s := NewSessionStore()
	sess := &models.Session{
		ID:        "session-1",
		UserID:    "user-1",
		CreatedAt: time.Now(),
	}

	s.Set(sess)

	retrieved, err := s.Get("session-1")
	if err != nil {
		t.Fatalf("expected to find session, got error: %v", err)
	}

	if retrieved.ID != sess.ID {
		t.Errorf("expected session ID %s, got %s", sess.ID, retrieved.ID)
	}
	if retrieved.UserID != sess.UserID {
		t.Errorf("expected user ID %s, got %s", sess.UserID, retrieved.UserID)
	}
}

func TestSessionStore_GetNotFound(t *testing.T) {
	s := NewSessionStore()

	_, err := s.Get("non-existent")
	if err == nil {
		t.Fatal("expected error for non-existent session, got nil")
	}
}

func TestSessionStore_Update(t *testing.T) {
	s := NewSessionStore()
	sess := &models.Session{
		ID:           "session-2",
		ThetaCurrent: 0.0,
	}

	s.Set(sess)

	err := s.Update("session-2", func(sess *models.Session) {
		sess.ThetaCurrent = 1.5
	})
	if err != nil {
		t.Fatalf("expected update to succeed, got error: %v", err)
	}

	retrieved, err := s.Get("session-2")
	if err != nil {
		t.Fatalf("expected to find session, got error: %v", err)
	}

	if retrieved.ThetaCurrent != 1.5 {
		t.Errorf("expected ThetaCurrent to be 1.5, got %f", retrieved.ThetaCurrent)
	}
}

func TestSessionStore_Delete(t *testing.T) {
	s := NewSessionStore()
	sess := &models.Session{
		ID: "session-3",
	}

	s.Set(sess)
	s.Delete("session-3")

	_, err := s.Get("session-3")
	if err == nil {
		t.Fatal("expected session to be deleted, but it was found")
	}
}

func TestSessionStore_ConcurrentAccess(t *testing.T) {
	s := NewSessionStore()
	var wg sync.WaitGroup

	// Let's run multiple readers, writers, and updaters concurrently
	for i := 0; i < 100; i++ {
		wg.Add(3)

		// Writer
		go func(id string) {
			defer wg.Done()
			s.Set(&models.Session{
				ID:           id,
				ThetaCurrent: 0.0,
			})
		}("sess-" + string(rune(i)))

		// Reader
		go func() {
			defer wg.Done()
			_, _ = s.Get("sess-0")
		}()

		// Updater
		go func() {
			defer wg.Done()
			_ = s.Update("sess-0", func(sess *models.Session) {
				sess.ThetaCurrent += 0.1
			})
		}()
	}

	wg.Wait()
}
