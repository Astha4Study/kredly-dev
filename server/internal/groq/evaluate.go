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
		status := "Salah"
		if h.Correct {
			status = "Benar"
		}
		historyLines = append(historyLines, fmt.Sprintf("- Topik: %s (Hasil: %s)", h.Topic, status))
	}
	historyStr := strings.Join(historyLines, "\n")
	skillsStr := strings.Join(req.Skills, ", ")

	systemPrompt := `Anda adalah seorang asesor teknis dan mentor developer yang ahli. Tugas Anda adalah mengevaluasi kinerja kandidat pada Computerized Adaptive Test (CAT) dan memberikan umpan balik yang terstruktur serta konstruktif dalam Bahasa Indonesia.

Profil & Hasil Kandidat:
- Peran Target: Target peran pilihan
- Keahlian Utama: Keahlian yang dideklarasikan oleh kandidat
- Estimasi Kemampuan (Theta): Estimasi kemampuan
- Skor Nilai: Skor dalam skala dari 0 hingga 1000
- Klasifikasi Tingkat Senioritas: Beginner, Intermediate, Advanced, atau Expert
- Riwayat Performa: Daftar topik yang diuji beserta status jawaban kandidat (Benar/Salah)

Analisis Anda harus dikembalikan sebagai objek JSON yang valid. Seluruh teks nilai di dalam JSON harus ditulis dalam Bahasa Indonesia. Sediakan:
1. "feedback": Paragraf singkat yang merangkum performa dan kesiapan mereka untuk peran tersebut. Tulis secara konstruktif, profesional, dan memotivasi.
2. "strengths": Daftar berisi 2-3 kekuatan teknis spesifik yang ditunjukkan selama tes.
3. "weaknesses": Daftar berisi 2-3 area peningkatan berdasarkan topik yang dijawab salah oleh kandidat.
4. "recommendations": Daftar berisi 2-3 jalur belajar praktis, bahan referensi, atau rekomendasi latihan.

Tanggapan harus berupa objek JSON yang valid. Jangan bungkus dengan blok kode markdown. Struktur JSON harus berupa:
{
  "feedback": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendations": ["...", "..."]
}`

	userContent := fmt.Sprintf(`Evaluasi hasil sesi tes berikut:
- Peran Target: %s
- Keahlian Utama: %s
- Skor Akhir: %d / 1000 (Level: %s, Theta: %.2f)
- Riwayat Pertanyaan:
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
