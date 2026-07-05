package groq

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/go-resty/resty/v2"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ResponseFormat struct {
	Type string `json:"type"`
}

type ChatCompletionRequest struct {
	Messages       []Message       `json:"messages"`
	Model          string          `json:"model"`
	Temperature    *float64        `json:"temperature,omitempty"`
	MaxTokens      *int            `json:"max_tokens,omitempty"`
	Stream         bool            `json:"stream,omitempty"`
	ResponseFormat *ResponseFormat `json:"response_format,omitempty"`
}

type ChatCompletionResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index        int     `json:"index"`
		Message      Message `json:"message"`
		FinishReason string  `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

type Client struct {
	apiKeys      []string
	currentIndex uint32
	baseURL      string
	httpClient   *resty.Client
}

func NewClient(apiKeys []string, baseURL string) *Client {
	if baseURL == "" {
		baseURL = "https://api.groq.com/openai/v1"
	}

	return &Client{
		apiKeys:    apiKeys,
		baseURL:    baseURL,
		httpClient: resty.New(),
	}
}

// getNextAPIKey rotates through the API keys using atomic round-robin
func (c *Client) getNextAPIKey() (string, error) {
	n := len(c.apiKeys)
	if n == 0 {
		return "", errors.New("groq api key is not configured")
	}

	// Increment counter atomically and modulo with number of keys
	idx := atomic.AddUint32(&c.currentIndex, 1) - 1
	return c.apiKeys[idx%uint32(n)], nil
}

// GetAPIKey returns the API key for external use (automatically rotated)
func (c *Client) GetAPIKey() string {
	key, err := c.getNextAPIKey()
	if err != nil {
		return ""
	}
	return key
}

// CreateChatCompletion sends a request to Groq's chat completion endpoint
func (c *Client) CreateChatCompletion(req ChatCompletionRequest) (*ChatCompletionResponse, error) {
	return c.createChatCompletionGeneric(req)
}

// getRetryDelay returns the sleep duration based on the Retry-After header or default backoff
func getRetryDelay(retryAfterHeader string, attempt int) time.Duration {
	if retryAfterHeader != "" {
		if seconds, err := strconv.Atoi(retryAfterHeader); err == nil && seconds > 0 {
			// Limit sleep to max 5 seconds to prevent browser HTTP timeout
			if seconds > 5 {
				return 5 * time.Second
			}
			return time.Duration(seconds) * time.Second
		}
	}
	// Fallback to exponential backoff: 1s, 2s, 4s...
	delay := time.Duration(1<<attempt) * time.Second
	if delay > 5*time.Second {
		return 5 * time.Second
	}
	return delay
}

// createChatCompletionGeneric handles both regular and vision requests
func (c *Client) createChatCompletionGeneric(req interface{}) (*ChatCompletionResponse, error) {
	nKeys := len(c.apiKeys)
	if nKeys == 0 {
		return nil, errors.New("groq api key is not configured")
	}

	maxRetries := nKeys * 2 // Try each key up to twice if needed, with delay
	var lastErr error

	for attempt := 0; attempt < maxRetries; attempt++ {
		apiKey, err := c.getNextAPIKey()
		if err != nil {
			return nil, err
		}

		var completionResponse ChatCompletionResponse
		url := fmt.Sprintf("%s/chat/completions", c.baseURL)

		resp, err := c.httpClient.R().
			SetHeader("Content-Type", "application/json").
			SetHeader("Authorization", fmt.Sprintf("Bearer %s", apiKey)).
			SetBody(req).
			SetResult(&completionResponse).
			Post(url)

		if err != nil {
			lastErr = fmt.Errorf("failed to send request to groq: %w", err)
			log.Printf("[Groq Client] Attempt %d/%d failed: %v", attempt+1, maxRetries, lastErr)
			continue
		}

		if resp.StatusCode() == http.StatusTooManyRequests { // 429
			retryAfter := resp.Header().Get("Retry-After")
			var sleepDuration time.Duration

			// If we only have 1 key, or if we have cycled through all keys once, apply delay
			if nKeys == 1 || attempt >= nKeys-1 {
				sleepDuration = getRetryDelay(retryAfter, attempt-nKeys+1)
				log.Printf("[Groq Client] Key rate limited (429). All keys checked. Sleeping %v before retry... (attempt %d/%d)", sleepDuration, attempt+1, maxRetries)
				time.Sleep(sleepDuration)
			} else {
				log.Printf("[Groq Client] Key rate limited (429). Trying next key immediately... (attempt %d/%d)", attempt+1, maxRetries)
			}

			lastErr = fmt.Errorf("rate limit reached (429): %s", resp.String())
			continue
		}

		if resp.StatusCode() != http.StatusOK {
			return nil, fmt.Errorf("groq api returned error code %d: %s", resp.StatusCode(), resp.String())
		}

		return &completionResponse, nil
	}

	return nil, fmt.Errorf("all %d API key attempts failed. Last error: %w", maxRetries, lastErr)
}
