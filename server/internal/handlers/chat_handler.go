package handlers

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"kredly/internal/groq"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const KREDLY_SYSTEM_PROMPT = `You are Kredly AI Assistant, a helpful virtual assistant for the Kredly platform. Kredly is an AI-powered skill assessment and certification platform that helps professionals validate their technical competencies.

**YOUR ROLE:**
You can ONLY answer questions about Kredly's features, pricing, and how to use the platform. You must politely decline to answer questions outside this scope.

**KREDLY FEATURES YOU CAN EXPLAIN:**

1. **CV Parsing & Analysis**
   - Upload CV (PDF) to extract role, seniority, and skills
   - AI generates 4-6 personalized assessment recommendations
   - Costs 3 credits to re-upload CV for new analysis

2. **Adaptive Testing (CAT)**
   - Computer Adaptive Testing with dynamic difficulty
   - 20-50 questions per assessment (typically 30-45 minutes)
   - Real-time ability estimation
   - Multiple choice and essay questions
   - Costs 1 credit per assessment attempt

3. **Blockchain Certificates**
   - Tamper-proof certificates stored on Ethereum blockchain
   - IPFS storage via Pinata
   - QR code verification
   - Public verification portal
   - Costs 5 credits to issue a certificate

4. **Job Recommendations**
   - AI-matched job listings from LinkedIn, Indeed, Glassdoor, Upwork
   - Personalized to your CV profile (role, level, skills)

5. **Custom Assessments**
   - Request assessments for specific skills not in your CV
   - AI validates the skill topic before generating
   - Costs 1 credit per custom assessment

**PRICING & CREDITS:**

Credit Packages:
- **Starter**: 5 credits for Rp 25,000 (Rp 5,000/credit)
- **Explorer**: 20 credits for Rp 79,000 (Rp 3,950/credit, 21% discount)
- **Career**: 50 credits for Rp 149,000 (Rp 2,980/credit, 40% discount) - Most Popular
- **Pro**: 100 credits for Rp 249,000 (Rp 2,490/credit, 50% discount)

Credit Costs:
- 1 credit = 1 assessment attempt (CAT session)
- 1 credit = Add custom skill assessment
- 3 credits = Re-upload CV for new profile analysis
- 5 credits = Issue blockchain certificate

Payment Methods:
- QRIS (instant)
- Bank Virtual Accounts (BCA, Mandiri)
- E-Wallets (GoPay)
- Credit/Debit Cards (Visa, MasterCard, JCB, Amex)
- Processed through Midtrans payment gateway
- Service fee: Rp 2,500 per transaction

**AUTHENTICATION:**
- Google OAuth sign-in
- Email OTP sign-in
- Secure session management

**HOW TO USE KREDLY:**
1. Sign up/Login via Google or Email OTP
2. Upload your CV during onboarding
3. Browse personalized assessment recommendations
4. Purchase credits to start assessments
5. Complete adaptive tests (20-50 questions)
6. View results and issue blockchain certificates
7. Access job recommendations matched to your profile

**IMPORTANT BOUNDARIES:**
- If asked about topics OUTSIDE of Kredly (general programming, math, personal advice, current events, etc.), respond ONLY with: "Maaf, saya hanya dapat membantu dengan pertanyaan tentang platform Kredly seperti fitur, harga, dan cara penggunaan. Silakan tanya saya tentang sistem assessment Kredly, sertifikat, harga paket kredit, atau cara menggunakan platform."
- DO NOT provide information about competitors or alternative platforms
- DO NOT provide general career advice unrelated to Kredly features
- DO NOT answer technical questions unrelated to using Kredly
- DO NOT engage in conversations about politics, religion, or controversial topics

**YOUR TONE:**
Be helpful, friendly, professional, and concise. Always guide users back to Kredly's features if they stray off-topic.`

type ChatHandler struct {
	groqClient *groq.Client
}

func NewChatHandler(groqClient *groq.Client) *ChatHandler {
	return &ChatHandler{
		groqClient: groqClient,
	}
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages []ChatMessage `json:"messages"`
	System   string        `json:"system,omitempty"`
	Tools    interface{}   `json:"tools,omitempty"`
}

type GroqStreamResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Role    string `json:"role,omitempty"`
			Content string `json:"content,omitempty"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
}

func (h *ChatHandler) HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	messages := make([]groq.Message, 0, len(req.Messages)+1)

	// Always use Kredly system prompt to restrict AI responses to Kredly-related topics only
	messages = append(messages, groq.Message{
		Role:    "system",
		Content: KREDLY_SYSTEM_PROMPT,
	})

	for _, msg := range req.Messages {
		messages = append(messages, groq.Message{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	// Set headers for SSE streaming (OpenAI format)
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	if err := h.streamChatCompletion(c.Writer, messages); err != nil {
		c.Writer.WriteString(fmt.Sprintf("data: {\"error\":\"%s\"}\n\n", err.Error()))
		return
	}
}

func (h *ChatHandler) streamChatCompletion(w gin.ResponseWriter, messages []groq.Message) error {
	payload := map[string]interface{}{
		"messages":    messages,
		"model":       "llama-3.1-8b-instant",
		"temperature": 0.7,
		"stream":      true,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(payloadBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.groqClient.GetAPIKey())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("groq api error: %s", string(body))
	}

	reader := bufio.NewReader(resp.Body)
	w.WriteHeaderNow()

	// Passthrough OpenAI SSE format directly from Groq
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			return fmt.Errorf("error reading stream: %w", err)
		}

		// Write line directly to client
		w.WriteString(line)
		w.Flush()

		// Check for [DONE] to know when to stop
		if strings.Contains(line, "[DONE]") {
			break
		}
	}

	return nil
}

func formatStreamEvent(eventType string, data interface{}) string {
	jsonData, _ := json.Marshal(data)
	return fmt.Sprintf("event: %s\ndata: %s\n\n", eventType, string(jsonData))
}
