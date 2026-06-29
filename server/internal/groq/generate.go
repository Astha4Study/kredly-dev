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

type CustomString string

func (cs *CustomString) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err == nil {
		*cs = CustomString(s)
		return nil
	}

	var arr []string
	if err := json.Unmarshal(b, &arr); err == nil {
		*cs = CustomString(strings.Join(arr, ", "))
		return nil
	}

	return fmt.Errorf("cannot unmarshal json value into string or array of strings")
}

type GeneratedItem struct {
	Type         string       `json:"type"` // "multiple_choice" atau "essay"
	Pertanyaan   string       `json:"pertanyaan"`
	Pilihan      []string     `json:"pilihan"`
	KunciJawaban CustomString `json:"kunci_jawaban"`
	Penjelasan   string       `json:"penjelasan"`
	BEstimated   float64      `json:"b_estimated"`
}

func (c *Client) GenerateItemBatch(ctx context.Context, req GenerateItemBatchRequest) ([]GeneratedItem, error) {
	if req.BatchSize <= 0 {
		req.BatchSize = 3
	}

	skillsStr := strings.Join(req.Skills, ", ")

	difficultyDesc := "sedang (b_estimated sekitar -0.5 hingga 0.5)"
	if req.Theta < -1.0 {
		difficultyDesc = "mudah (b_estimated sekitar -1.5 hingga -0.5)"
	} else if req.Theta >= 1.5 {
		difficultyDesc = "ahli (b_estimated sekitar 1.5 hingga 2.5)"
	} else if req.Theta >= 0.5 {
		difficultyDesc = "sulit (b_estimated sekitar 0.5 hingga 1.5)"
	}

	systemPrompt := fmt.Sprintf(`Anda adalah seorang pewawancara teknis ahli dan mesin pengujian adaptif. Tujuan Anda adalah menghasilkan batch berisi %d soal campuran (pilihan ganda atau essay) dalam Bahasa Indonesia untuk profil kandidat berikut:
- Peran Target: %s
- Keahlian Utama: %s
- Konteks Ringkasan CV: %s
- Topik Target: %s
- Tingkat Kemampuan Kandidat Saat Ini (Theta): %.2f
- Tingkat Kesulitan Soal yang Diperlukan: %s

Setiap pertanyaan, pilihan jawaban, kunci jawaban, dan penjelasan HARUS ditulis dalam Bahasa Indonesia yang baik dan profesional.

─── KOMPOSISI SOAL ───
- 70%% dari batch soal harus berbentuk studi kasus/skenario kerja nyata.
- 30%% dari batch soal harus menguji pemahaman konsep teknis secara langsung.
- Ketentuan distribusi ini berlaku secara konsisten untuk SEMUA jenis role/skill (tidak hanya programming, melainkan juga desain, marketing, manajemen, dll.).

─── CIRI SOAL STUDI KASUS (70%%) ───
- Soal HARUS dimulai dengan konteks situasi kerja nyata (2-3 kalimat).
- Minta kandidat mengambil keputusan atau menyelesaikan masalah berdasarkan situasi tersebut.
- HINDARI menanyakan definisi/hafalan. Fokuslah pada "apa yang akan kamu lakukan" atau "mana solusi yang tepat".
- Contoh Backend Engineer: "Tim kamu menerima laporan bahwa endpoint /api/orders mengalami response time 8 detik saat traffic tinggi, padahal normal di bawah 500ms. Setelah dicek, query database-nya melakukan full table scan. Apa langkah PERTAMA yang paling tepat?"
- Contoh Digital Marketer: "Campaign Google Ads kamu sudah berjalan 2 minggu dengan CTR 1.2%% (di bawah rata-rata industri 3-5%%) tapi conversion rate justru tinggi di 4%%. Apa yang sebaiknya jadi fokus optimasi selanjutnya?"

─── CIRI SOAL KONSEP TEKNIS (30%%) ───
- Harus tetap relevan dengan aplikasi praktis sehari-hari, bukan hafalan mentah atau definisi teoretis kosong.
- Contoh yang BAIK: "Kapan sebaiknya pakai index composite vs index tunggal di database?"
- Contoh yang DIHINDARI: "Apa kepanjangan dari ACID dalam database?"

Untuk setiap soal dalam batch, Anda harus memilih secara dinamis untuk menghasilkan salah satu format berikut:

1. Untuk PILIHAN GANDA ("type": "multiple_choice"):
   - Sediakan tepat 4 pilihan jawaban dalam "pilihan".
   - "kunci_jawaban" harus berupa 'A', 'B', 'C', atau 'D'.
   - Tulis penjelasan yang jelas di "penjelasan".

2. Untuk ESSAY ("type": "essay"):
   - Set "pilihan" menjadi array kosong [].
   - Pertanyaan essay HARUS dirancang agar cukup dijawab secara singkat, padat, dan langsung pada inti (misal: cukup 1-3 kalimat atau berupa poin-poin kunci). Hindari pertanyaan yang membutuhkan penjelasan panjang lebar.
   - "kunci_jawaban" harus berupa string berisi daftar kata kunci teknis utama (misal: "Provider, Riverpod, setState") atau konsep kunci singkat yang wajib dijawab kandidat.
   - Berikan contoh jawaban model yang singkat dan padat (1-2 kalimat saja) di "penjelasan".

3. "b_estimated" harus sesuai dengan tingkat kesulitan soal yang diperlukan.

Respons harus berupa array JSON objek pertanyaan yang valid. Jangan bungkus dengan markdown block. Struktur JSON harus tepat seperti ini:
[
  {
    "type": "multiple_choice",
    "pertanyaan": "Pertanyaan pilihan ganda...",
    "pilihan": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "kunci_jawaban": "A",
    "penjelasan": "Penjelasan...",
    "b_estimated": 0.5
  },
  {
    "type": "essay",
    "pertanyaan": "Pertanyaan essay...",
    "pilihan": [],
    "kunci_jawaban": "Rubrik penilaian...",
    "penjelasan": "Contoh jawaban model...",
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
				Content: fmt.Sprintf("Hasilkan batch berisi %d soal campuran (pilihan ganda atau essay) untuk topik: %s dalam Bahasa Indonesia", req.BatchSize, req.Topic),
			},
		},
		Model: "qwen/qwen3-32b",
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

	// Sometimes models return the array directly, sometimes wrapped in a root object, or as a single object.
	// We'll handle all three cases.
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
			// Try parsing as single object and wrap it in array
			var singleItem GeneratedItem
			if errSingle := json.Unmarshal([]byte(content), &singleItem); errSingle == nil {
				items = []GeneratedItem{singleItem}
			} else {
				return nil, fmt.Errorf("failed to parse groq response JSON: %w (content: %s)", err, content)
			}
		}
	}

	if len(items) == 0 {
		return nil, fmt.Errorf("no valid questions found in parsed response (content: %s)", content)
	}

	// Normalize key answers to uppercase for multiple choice questions only
	for i := range items {
		if items[i].Type == "multiple_choice" {
			items[i].KunciJawaban = CustomString(strings.ToUpper(strings.TrimSpace(string(items[i].KunciJawaban))))
		}
	}

	return items, nil
}
