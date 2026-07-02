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

	if req.System != "" {
		messages = append(messages, groq.Message{
			Role:    "system",
			Content: req.System,
		})
	}

	for _, msg := range req.Messages {
		messages = append(messages, groq.Message{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	if err := h.streamChatCompletion(c.Writer, messages); err != nil {
		c.SSEvent("error", gin.H{"message": err.Error()})
		return
	}
}

func (h *ChatHandler) streamChatCompletion(w gin.ResponseWriter, messages []groq.Message) error {
	payload := map[string]interface{}{
		"messages":    messages,
		"model":       "llama-3.3-70b-versatile",
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

	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if err == io.EOF {
				break
			}
			return fmt.Errorf("error reading stream: %w", err)
		}

		line = strings.TrimSpace(line)
		if line == "" || !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			w.WriteString(formatStreamEvent("message_stop", map[string]interface{}{
				"type": "message_stop",
			}))
			w.Flush()
			break
		}

		var streamResp GroqStreamResponse
		if err := json.Unmarshal([]byte(data), &streamResp); err != nil {
			continue
		}

		if len(streamResp.Choices) == 0 {
			continue
		}

		choice := streamResp.Choices[0]

		if choice.Delta.Content != "" {
			event := map[string]interface{}{
				"type": "content_block_delta",
				"index": 0,
				"delta": map[string]interface{}{
					"type": "text_delta",
					"text": choice.Delta.Content,
				},
			}
			w.WriteString(formatStreamEvent("content_block_delta", event))
			w.Flush()
		}

		if choice.FinishReason != nil && *choice.FinishReason == "stop" {
			w.WriteString(formatStreamEvent("message_stop", map[string]interface{}{
				"type": "message_stop",
			}))
			w.Flush()
			break
		}
	}

	return nil
}

func formatStreamEvent(eventType string, data interface{}) string {
	jsonData, _ := json.Marshal(data)
	return fmt.Sprintf("event: %s\ndata: %s\n\n", eventType, string(jsonData))
}
