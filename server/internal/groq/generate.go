package groq

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
)

type GenerateItemBatchRequest struct {
	Theta     float64
	CVSummary string
	Topic     string
	BatchSize int
	Role      string
	Skills    []string
}

type GeneratedItem struct {
	Pertanyaan   string   `json:"pertanyaan"`
	Pilihan      []string `json:"pilihan"`
	KunciJawaban string   `json:"kunci_jawaban"`
	Penjelasan   string   `json:"penjelasan"`
	BEstimated   float64  `json:"b_estimated"`
}

func (c *Client) GenerateItemBatch(ctx context.Context, req GenerateItemBatchRequest) ([]GeneratedItem, error) {
	if req.BatchSize <= 0 {
		req.BatchSize = 3
	}

	skillsStr := strings.Join(req.Skills, ", ")

	difficultyDesc := "medium (b_estimated around -0.5 to 0.5)"
	if req.Theta < -1.0 {
		difficultyDesc = "easy (b_estimated around -1.5 to -0.5)"
	} else if req.Theta >= 1.5 {
		difficultyDesc = "expert (b_estimated around 1.5 to 2.5)"
	} else if req.Theta >= 0.5 {
		difficultyDesc = "hard (b_estimated around 0.5 to 1.5)"
	}

	systemPrompt := fmt.Sprintf(`You are an expert technical interviewer and adaptive testing engine. Your goal is to generate a batch of %d multiple-choice questions for the following candidate profile:
- Target Role: %s
- Key Skills: %s
- CV Summary Context: %s
- Target Topic: %s
- Candidate Current Ability Level (Theta): %.2f
- Required Question Difficulty: %s

For each question:
1. Write a high-quality, practical multiple-choice question relevant to the topic and the target role.
2. Provide exactly 4 options.
3. Identify the correct answer (must be 'A', 'B', 'C', or 'D').
4. Write a clear, educational explanation for the correct answer.
5. Estimate the question's difficulty (b_estimated) on a scale from -4.0 (very easy) to +4.0 (extremely hard), which should match the required question difficulty level.

Response must be a valid JSON array of question objects. Do not wrap in markdown code blocks. The JSON structure must strictly be:
[
  {
    "pertanyaan": "Question text...",
    "pilihan": ["Option A", "Option B", "Option C", "Option D"],
    "kunci_jawaban": "A",
    "penjelasan": "Explanation...",
    "b_estimated": 0.5
  }
]`, req.BatchSize, req.Role, skillsStr, req.CVSummary, req.Topic, req.Theta, difficultyDesc)

	// Build request
	chatReq := ChatCompletionRequest{
		Messages: []Message{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Generate a batch of %d multiple-choice questions for the topic: %s", req.BatchSize, req.Topic),
			},
		},
		ResponseFormat: &ResponseFormat{
			Type: "json_object",
		},
	}

	// Call Groq API
	resp, err := c.CreateChatCompletion(chatReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call groq for generating items: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("groq returned no choices")
	}

	// Parse the response
	content := resp.Choices[0].Message.Content
	
	// Sometimes models return the array directly, sometimes wrapped in a root object.
	// We'll handle both.
	var items []GeneratedItem
	if err := json.Unmarshal([]byte(content), &items); err != nil {
		// Try parsing if wrapped in a key like "questions" or "items"
		var wrapper map[string][]GeneratedItem
		if errWrap := json.Unmarshal([]byte(content), &wrapper); errWrap == nil {
			for _, v := range wrapper {
				if len(v) > 0 {
					items = v
					break
				}
			}
		} else {
			return nil, fmt.Errorf("failed to parse groq response JSON: %w (content: %s)", err, content)
		}
	}

	if len(items) == 0 {
		return nil, fmt.Errorf("no valid questions found in parsed response (content: %s)", content)
	}

	// Normalize key answers to uppercase
	for i := range items {
		items[i].KunciJawaban = strings.ToUpper(strings.TrimSpace(items[i].KunciJawaban))
	}

	return items, nil
}
