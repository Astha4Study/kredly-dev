package groq

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
)

type EvaluateRequest struct {
	Role       string
	Skills     []string
	ThetaFinal float64
	Score      int
	Level      string
	History    []EvaluateHistoryItem
}

type EvaluateHistoryItem struct {
	Topic   string
	Correct bool
}

type EvaluateResponse struct {
	Feedback        string   `json:"feedback"`
	Strengths       []string `json:"strengths"`
	Weaknesses      []string `json:"weaknesses"`
	Recommendations []string `json:"recommendations"`
}

func (c *Client) EvaluateSession(ctx context.Context, req EvaluateRequest) (*EvaluateResponse, error) {
	var historyLines []string
	for _, h := range req.History {
		status := "Incorrect"
		if h.Correct {
			status = "Correct"
		}
		historyLines = append(historyLines, fmt.Sprintf("- Topic: %s (Result: %s)", h.Topic, status))
	}
	historyStr := strings.Join(historyLines, "\n")
	skillsStr := strings.Join(req.Skills, ", ")

	systemPrompt := `You are an expert technical assessor and developer mentor. Your task is to evaluate a candidate's performance on a Computerized Adaptive Test (CAT) and provide structured, constructive feedback.

Candidate Profile & Results:
- Target Role: Option target role
- Key Skills: Skills declared by the candidate
- Ability Estimate (Theta): Ability estimate
- Scored Points: Score on a scale from 0 to 1000
- Seniority Level Classification: Beginner, Intermediate, Advanced, or Expert
- Performance History: List of topic areas tested and whether candidate answered correctly

Your analysis must be returned as a valid JSON object. Provide:
1. "feedback": A brief paragraph summarizing their performance and readiness for the role. Be constructive, professional, and encouraging.
2. "strengths": A list of 2-3 specific technical strengths demonstrated during the test.
3. "weaknesses": A list of 2-3 areas for improvement based on topics they answered incorrectly.
4. "recommendations": A list of 2-3 actionable learning paths, reference materials, or practice recommendations.

Response must be a valid JSON object. Do not wrap in markdown code blocks. The JSON structure must strictly be:
{
  "feedback": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendations": ["...", "..."]
}`

	userContent := fmt.Sprintf(`Evaluate the following test session results:
- Target Role: %s
- Key Skills: %s
- Final Score: %d / 1000 (Level: %s, Theta: %.2f)
- Question History:
%s`, req.Role, skillsStr, req.Score, req.Level, req.ThetaFinal, historyStr)

	chatReq := ChatCompletionRequest{
		Messages: []Message{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: userContent,
			},
		},
		ResponseFormat: &ResponseFormat{
			Type: "json_object",
		},
	}

	resp, err := c.CreateChatCompletion(chatReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call groq for session evaluation: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("groq returned no choices")
	}

	content := resp.Choices[0].Message.Content

	var evalResp EvaluateResponse
	if err := json.Unmarshal([]byte(content), &evalResp); err != nil {
		return nil, fmt.Errorf("failed to parse evaluation response JSON: %w (content: %s)", err, content)
	}

	return &evalResp, nil
}

type EssayGradeRequest struct {
	Question     string
	Rubric       string
	UserResponse string
}

type EssayGradeResponse struct {
	Score       int    `json:"score"`
	Explanation string `json:"explanation"`
}

func (c *Client) GradeEssay(ctx context.Context, req EssayGradeRequest) (*EssayGradeResponse, error) {
	systemPrompt := `Anda adalah penilai teknis ahli. Evaluasi jawaban kandidat terhadap pertanyaan teknis berdasarkan rubrik/kunci jawaban yang disediakan.
Pertanyaan ini dirancang untuk dijawab secara singkat dan padat (cukup 1-3 kalimat atau poin-poin kunci). Oleh karena itu, JANGAN kurangi nilai karena jawaban terlalu pendek. Berikan nilai penuh (100) atau tinggi jika jawaban kandidat telah mencakup kata kunci teknis utama atau konsep kunci yang diminta dalam rubrik/kunci jawaban, meskipun ditulis dengan sangat ringkas.
Berikan nilai numerik/skor dalam rentang 0 sampai 100, di mana 100 mewakili pemahaman sempurna terhadap rubrik, dan 0 mewakili jawaban yang tidak relevan atau salah. Semakin mendekati jawaban benar, berikan skor yang semakin tinggi secara proporsional.
Berikan penjelasan singkat (1-2 kalimat) dalam Bahasa Indonesia mengenai apa yang benar, apa yang terlewat, dan alasan di balik skor tersebut.

Semua teks penjelasan HARUS ditulis dalam Bahasa Indonesia.

Respons harus berupa objek JSON yang valid:
{
  "score": 85,
  "explanation": "..."
}`

	userContent := fmt.Sprintf("Pertanyaan: %s\nRubric: %s\nJawaban Kandidat: %s", req.Question, req.Rubric, req.UserResponse)

	chatReq := ChatCompletionRequest{
		Messages: []Message{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: userContent,
			},
		},
		ResponseFormat: &ResponseFormat{
			Type: "json_object",
		},
	}

	resp, err := c.CreateChatCompletion(chatReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call groq for essay grading: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("groq returned no choices")
	}

	content := resp.Choices[0].Message.Content

	var gradeResp EssayGradeResponse
	if err := json.Unmarshal([]byte(content), &gradeResp); err != nil {
		return nil, fmt.Errorf("failed to parse essay grade JSON: %w (content: %s)", err, content)
	}

	return &gradeResp, nil
}
