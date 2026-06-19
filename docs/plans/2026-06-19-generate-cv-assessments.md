# Generate CV Assessments Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dynamically generate role-based and skill-specific assessments from the candidate's CV upload, save them in the `UserProfile` MongoDB collection, and fetch them in the React assessment page.

**Architecture:**

- Update the Go MongoDB models to include a new `GeneratedAssessment` struct inside `UserProfile`.
- Update the system prompts in both `cv.go` and `onboarding_handler.go` to ask Groq to output matching assessments for the parsed profile.
- Save the generated assessments in `userProfile` collection during onboarding and CV re-parsing.
- Retrieve the assessments list in the React `/app/assasemen` page and dynamically render them.

**Tech Stack:** Go, Gin, MongoDB, Groq AI, React, Tailwind CSS

---

### Task 1: Update Go Database Models

**Files:**

- Modify: `server/internal/models/auth.go`

**Step 1: Write code changes**

Update the `UserProfile` struct and define the `GeneratedAssessment` helper struct:

```go
// Add in server/internal/models/auth.go

type GeneratedAssessment struct {
	ID            string   `bson:"id" json:"id"`
	Type          string   `bson:"type" json:"type"` // "general" or "skill"
	Title         string   `bson:"title" json:"title"`
	Description   string   `bson:"description,omitempty" json:"description,omitempty"`
	Difficulty    string   `bson:"difficulty" json:"difficulty"`
	EstimatedTime string   `bson:"estimatedTime" json:"estimatedTime"`
	QuestionCount int      `bson:"questionCount" json:"questionCount"`
	Topics        []string `bson:"topics,omitempty" json:"topics,omitempty"`
	IsRecommended bool     `bson:"isRecommended" json:"isRecommended"`
	Category      string   `bson:"category" json:"category"`
	Status        string   `bson:"status" json:"status"` // "available", "in-progress", "completed"
	Progress      int      `bson:"progress,omitempty" json:"progress,omitempty"`
}

// Inside UserProfile struct, add:
CVAssessments []GeneratedAssessment `bson:"cvAssessments,omitempty" json:"cvAssessments,omitempty"`
```

**Step 2: Verify Go compilation**

Run: `go build -o tmp_build cmd/api/main.go` inside the `server/` directory.
Expected: PASS (compiles successfully without errors).

**Step 3: Commit**

```bash
git add server/internal/models/auth.go
git commit -m "db: add CVAssessments models to UserProfile"
```

---

### Task 2: Update CV Parser Handler to Generate Assessments

**Files:**

- Modify: `server/internal/handlers/cv.go`

**Step 1: Modify Groq system prompt and JSON schema parser**

Update `cv.go` to instruct Groq to generate matching assessments, parse the result, and save it to the `userProfile` collection.

```go
// In server/internal/handlers/cv.go

// Update parsedCV struct:
type parsedCV struct {
	Role        string                       `json:"role"`
	Level       string                       `json:"level"`
	Skills      []string                     `json:"skills"`
	Summary     string                       `json:"summary"`
	Assessments []models.GeneratedAssessment `json:"assessments"`
}

// Update the systemPrompt schema instructions:
`{
  "role": "Candidate's primary role or title (e.g., Backend Engineer)",
  "level": "Candidate's seniority level (e.g., Junior, Mid, Senior, Lead)",
  "skills": ["Skill 1", "Skill 2"],
  "summary": "...",
  "assessments": [
    {
      "id": "gen_1",
      "type": "general",
      "title": "Front End",
      "description": "Menguji kompetensi komprehensif...",
      "difficulty": "Intermediate",
      "estimatedTime": "60 menit",
      "questionCount": 40,
      "topics": ["HTML5 & Semantic Elements", "React Hooks"],
      "isRecommended": true,
      "category": "Frontend",
      "status": "available"
    }
  ]
}`
```

**Step 2: Save the generated assessments to userProfile**

```go
// In server/internal/handlers/cv.go inside update logic:
userProfileColl := database.DB.Collection("userProfile")
profileUpdate := bson.M{
	"$set": bson.M{
		"cvRole":        parsed.Role,
		"cvLevel":       parsed.Level,
		"cvSkills":      parsed.Skills,
		"cvSummary":     cvSummary,
		"cvAssessments": parsed.Assessments,
		"updatedAt":     now,
	},
}
_, updateErrProfile := userProfileColl.UpdateOne(c.Request.Context(), bson.M{"userId": loggedInUser.ID}, profileUpdate)
```

**Step 3: Verify Go compilation**

Run: `go build -o tmp_build cmd/api/main.go` inside the `server/` directory.
Expected: PASS

**Step 4: Commit**

```bash
git add server/internal/handlers/cv.go
git commit -m "feat: parse and store assessments in cv handler"
```

---

### Task 3: Update Onboarding Parser Handler to Generate Assessments

**Files:**

- Modify: `server/internal/handlers/onboarding_handler.go`

**Step 1: Update the Groq prompt and parsing schema**

Update onboarding parser to follow the exact same assessment-generation prompt schema as Task 2.

**Step 2: Save generated assessments inside UserProfile creation**

When inserting the new userProfile:

```go
	var parsedAssessments []models.GeneratedAssessment
	if parsed.Assessments != nil {
		parsedAssessments = parsed.Assessments
	}

	userProfile := models.UserProfile{
		// ...
		CVRole:        parsedRole,
		CVLevel:       parsedLevel,
		CVSkills:      parsedSkills,
		CVSummary:     cvSummary,
		CVAssessments: parsedAssessments,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
```

**Step 3: Verify Go compilation**

Run: `go build -o tmp_build cmd/api/main.go` inside the `server/` directory.
Expected: PASS

**Step 4: Commit**

```bash
git add server/internal/handlers/onboarding_handler.go
git commit -m "feat: parse and store assessments in onboarding handler"
```

---

### Task 4: Connect React Assessment UI with Live Profile Data

**Files:**

- Modify: `src/routes/_app/app/assasemen/index.tsx`
- Modify: `src/routes/_app/assasemen/index.tsx`

**Step 1: Fetch profile from `/api/profile` on component mount**

Add state variables and a profile fetcher block:

```tsx
const [availableAssessments, setAvailableAssessments] = React.useState<
  Assessment[]
>([]);
const [generalAssessments, setGeneralAssessments] = React.useState<
  GeneralAssessment[]
>([]);
const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);

React.useEffect(() => {
  async function fetchAssessments() {
    try {
      const response = await fetch('/api/profile', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (
          data.profile &&
          data.profile.cvAssessments &&
          data.profile.cvAssessments.length > 0
        ) {
          const gen = data.profile.cvAssessments.filter(
            (a: any) => a.type === 'general',
          );
          const skill = data.profile.cvAssessments.filter(
            (a: any) => a.type === 'skill',
          );

          // Map keys/properties to match client camelCase expectations
          setGeneralAssessments(
            gen.map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.description,
              difficulty: a.difficulty,
              estimatedTime: a.estimatedTime,
              questionCount: a.questionCount,
              topics: a.topics || [],
              isRecommended: a.isRecommended,
            })),
          );

          setAvailableAssessments(
            skill.map((a: any) => ({
              id: a.id,
              skillName: a.title,
              difficulty: a.difficulty,
              estimatedTime: a.estimatedTime,
              questionCount: a.questionCount,
              isRecommended: a.isRecommended,
              category: a.category || 'General',
              status: 'available',
            })),
          );
          setIsLoadingProfile(false);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load profile assessments', e);
    }

    // Fallback to static mock data if profile assessments are not loaded
    // ... (set defaults)
    setIsLoadingProfile(false);
  }
  fetchAssessments();
}, []);
```

**Step 2: Run formatting and frontend check**

Run: `cmd.exe /c pnpm run format`
Run: `cmd.exe /c pnpm run lint`
Expected: PASS

**Step 3: Commit**

```bash
git add src/routes/_app/app/assasemen/index.tsx src/routes/_app/assasemen/index.tsx
git commit -m "feat: render dynamically generated assessments from parsed CV"
```
