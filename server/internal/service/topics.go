package service

import (
	"math/rand"
	"strings"
	"time"
)

func init() {
	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())
}

var roleTopics = map[string][]string{
	"backend engineer": {
		"Database Design",
		"API Architecture",
		"Concurrency & Parallelism",
		"System Design",
		"Security Best Practices",
		"Performance Optimization",
		"Data Structures & Algorithms",
		"Microservices",
		"Testing & Quality",
		"DevOps & CI/CD",
	},
	"frontend engineer": {
		"HTML & CSS",
		"JavaScript Fundamentals",
		"React & Component Architecture",
		"State Management",
		"Web Performance",
		"Accessibility",
		"Browser APIs",
		"Testing",
		"Build Tools & Bundlers",
		"UI/UX Patterns",
	},
	"fullstack engineer": {
		"HTML & CSS",
		"React & Component Architecture",
		"API Architecture",
		"Database Design",
		"Concurrency & Parallelism",
		"System Design",
		"Security Best Practices",
		"Web Performance",
		"State Management",
		"DevOps & CI/CD",
	},
	"data engineer": {
		"Data Warehousing",
		"ETL Pipelines",
		"SQL & Query Optimization",
		"Big Data Technologies",
		"Data Modeling",
		"Distributed Systems",
		"NoSQL Databases",
		"Cloud Data Services",
		"Data Quality & Governance",
		"Data Structures & Algorithms",
	},
	"devops engineer": {
		"Infrastructure as Code",
		"Containerization",
		"Orchestration",
		"CI/CD Pipelines",
		"Cloud Platforms",
		"Monitoring & Logging",
		"Networking & Security",
		"Linux Administration",
		"Scripting & Automation",
		"High Availability",
	},
}

// Map for displaying proper casing of the roles
var displayRoles = map[string]string{
	"backend engineer":   "Backend Engineer",
	"frontend engineer":  "Frontend Engineer",
	"fullstack engineer": "Fullstack Engineer",
	"data engineer":      "Data Engineer",
	"devops engineer":    "DevOps Engineer",
}

// NormalizeRole normalizes the input role string and maps common synonyms to supported roles
func NormalizeRole(role string) string {
	r := strings.ToLower(strings.TrimSpace(role))
	r = strings.ReplaceAll(r, "-", "")
	r = strings.ReplaceAll(r, " ", "")
	r = strings.ReplaceAll(r, "_", "")

	if strings.Contains(r, "frontend") || strings.Contains(r, "react") || strings.Contains(r, "nextjs") || strings.Contains(r, "angular") || strings.Contains(r, "vue") {
		return "frontend engineer"
	}
	if strings.Contains(r, "backend") || strings.Contains(r, "golang") || strings.Contains(r, "nodejs") || strings.Contains(r, "laravel") || strings.Contains(r, "django") || strings.Contains(r, "java") || strings.Contains(r, "spring") {
		return "backend engineer"
	}
	if strings.Contains(r, "fullstack") {
		return "fullstack engineer"
	}
	if strings.Contains(r, "devops") || strings.Contains(r, "cloud") || strings.Contains(r, "kubernetes") || strings.Contains(r, "sre") {
		return "devops engineer"
	}
	if strings.Contains(r, "data") || strings.Contains(r, "etl") || strings.Contains(r, "analytics") || strings.Contains(r, "database") {
		return "data engineer"
	}

	return r
}

// ValidateRole returns true if the role string is not empty (allowing any role)
func ValidateRole(role string) bool {
	return strings.TrimSpace(role) != ""
}

// GetAvailableRoles returns the display names of all configured roles
func GetAvailableRoles() []string {
	roles := make([]string, 0, len(roleTopics))
	for k := range roleTopics {
		roles = append(roles, displayRoles[k])
	}
	return roles
}

// PickTopic picks a random topic/skill for the given role that hasn't been seen yet.
// If skills are provided from the CV, it uses them as the topic list.
// If all topics have been seen, it resets and picks from all topics.
func PickTopic(role string, skills []string, seenTopics []string) string {
	var topics []string
	if len(skills) > 0 {
		topics = skills
	} else {
		norm := NormalizeRole(role)
		var exists bool
		topics, exists = roleTopics[norm]
		if !exists {
			// Fallback to backend engineer if the role is not found
			topics = roleTopics["backend engineer"]
		}
	}

	// Create a map of seen topics for quick lookup
	seenMap := make(map[string]bool)
	for _, t := range seenTopics {
		seenMap[strings.ToLower(t)] = true
	}

	// Filter available topics
	var available []string
	for _, t := range topics {
		if !seenMap[strings.ToLower(t)] {
			available = append(available, t)
		}
	}

	// If all topics have been seen, reset and use all topics
	if len(available) == 0 {
		available = topics
	}

	// Pick a random topic from available list
	idx := rand.Intn(len(available))
	return available[idx]
}
