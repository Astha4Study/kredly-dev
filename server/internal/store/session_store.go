package store

import (
	"errors"
	"sync"
	"kredly/internal/models"
)

type SessionStore struct {
	mu   sync.RWMutex
	data map[string]*models.Session
}

func NewSessionStore() *SessionStore {
	return &SessionStore{
		data: make(map[string]*models.Session),
	}
}

func (s *SessionStore) Set(sess *models.Session) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[sess.ID] = sess
}

func (s *SessionStore) Get(id string) (*models.Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sess, exists := s.data[id]
	if !exists {
		return nil, errors.New("session not found")
	}
	return sess, nil
}

func (s *SessionStore) Update(id string, fn func(*models.Session)) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	sess, exists := s.data[id]
	if !exists {
		return errors.New("session not found")
	}
	fn(sess)
	return nil
}

func (s *SessionStore) Delete(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.data, id)
}
