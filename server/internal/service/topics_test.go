package service

import (
	"testing"
)

func TestValidateRole(t *testing.T) {
	if !ValidateRole("Backend Engineer") {
		t.Error("expected Backend Engineer to be valid")
	}
	if !ValidateRole("backend engineer") {
		t.Error("expected backend engineer (lowercase) to be valid")
	}
	if !ValidateRole("  DevOps Engineer  ") {
		t.Error("expected DevOps Engineer with whitespace to be valid")
	}
	if !ValidateRole("Astronaut") {
		t.Error("expected Astronaut to be valid")
	}
	if ValidateRole("") {
		t.Error("expected empty string to be invalid")
	}
}

func TestGetAvailableRoles(t *testing.T) {
	roles := GetAvailableRoles()
	if len(roles) != 5 {
		t.Errorf("expected 5 roles, got %d", len(roles))
	}
}

func TestPickTopic(t *testing.T) {
	// Standard picking
	topic := PickTopic("Backend Engineer", nil, []string{})
	if topic == "" {
		t.Error("expected topic to not be empty")
	}

	// Picking with seen topics
	seen := []string{
		"Database Design", "API Architecture", "Concurrency & Parallelism",
		"System Design", "Security Best Practices", "Performance Optimization",
		"Data Structures & Algorithms", "Microservices", "Testing & Quality",
	}
	// Only "DevOps & CI/CD" remains
	topic = PickTopic("Backend Engineer", nil, seen)
	if topic != "DevOps & CI/CD" {
		t.Errorf("expected remaining topic 'DevOps & CI/CD', got '%s'", topic)
	}

	// Reset when all topics seen
	seen = append(seen, "DevOps & CI/CD")
	topic = PickTopic("Backend Engineer", nil, seen)
	if topic == "" {
		t.Error("expected topic to be picked even after resetting seen list")
	}

	// Dynamic picking using skills from CV
	customSkills := []string{"NextJS", "TailwindCSS", "Prisma"}
	topic = PickTopic("Frontend Engineer", customSkills, []string{"NextJS", "TailwindCSS"})
	if topic != "Prisma" {
		t.Errorf("expected topic 'Prisma' from custom skills list, got '%s'", topic)
	}
}
