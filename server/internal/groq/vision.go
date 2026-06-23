package groq

// ContentPart represents a part of a message content (text or image)
type ContentPart struct {
	Type     string    `json:"type"` // "text" or "image_url"
	Text     string    `json:"text,omitempty"`
	ImageURL *ImageURL `json:"image_url,omitempty"`
}

// ImageURL represents an image in a message
type ImageURL struct {
	URL string `json:"url"` // data:image/jpeg;base64,... or https://...
}

// VisionMessage represents a message with vision capability
type VisionMessage struct {
	Role    string        `json:"role"`
	Content []ContentPart `json:"content"`
}

// VisionChatCompletionRequest for vision-capable models
type VisionChatCompletionRequest struct {
	Messages       []VisionMessage `json:"messages"`
	Model          string          `json:"model"`
	Temperature    *float64        `json:"temperature,omitempty"`
	MaxTokens      *int            `json:"max_tokens,omitempty"`
	Stream         bool            `json:"stream,omitempty"`
	ResponseFormat *ResponseFormat `json:"response_format,omitempty"`
}

// CreateVisionChatCompletion sends a vision-capable request to Groq
func (c *Client) CreateVisionChatCompletion(req VisionChatCompletionRequest) (*ChatCompletionResponse, error) {
	// Use the same chat completions endpoint
	// The API handles both text-only and vision requests
	return c.createChatCompletionGeneric(req)
}
