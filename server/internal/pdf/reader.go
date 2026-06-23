package pdf

import (
	"fmt"
	"strings"
	"time"

	"kredly/internal/groq"
)

// ReadPDFTextWithVisionFallback tries text extraction first, falls back to vision if insufficient
// frontendImages are base64-encoded images rendered by PDF.js on the frontend
func ReadPDFTextWithVisionFallback(path string, groqClient *groq.Client, frontendImages []string) (string, error) {
	// Try normal text extraction first
	text, err := ReadPDFText(path)

	// If text extraction succeeded and has sufficient content, return it
	if err == nil && len(strings.TrimSpace(text)) >= 100 {
		return text, nil
	}

	// Text extraction failed or insufficient - try vision-based extraction
	if groqClient == nil {
		if err != nil {
			return "", fmt.Errorf("text extraction failed: %w. Hint: Pastikan CV berformat text-based PDF atau Word (bukan image-based seperti Canva)", err)
		}
		return "", fmt.Errorf("CV tidak dapat dibaca (text terlalu sedikit: %d chars). Gunakan CV berformat text-based PDF atau Word", len(strings.TrimSpace(text)))
	}

	// Use images from frontend (rendered by PDF.js)
	var images []string
	if len(frontendImages) > 0 {
		images = frontendImages
	} else {
		// No frontend images provided - cannot proceed with vision
		if err != nil {
			return "", fmt.Errorf("text extraction failed and no images provided for vision processing: %w", err)
		}
		return "", fmt.Errorf("CV tidak dapat dibaca (text terlalu sedikit: %d chars) dan tidak ada gambar untuk vision processing", len(strings.TrimSpace(text)))
	}

	// Extract text from images using Groq Vision
	visionText, visionErr := extractTextFromImages(images, groqClient)
	if visionErr != nil {
		// Vision failed, return original text if available
		if err == nil {
			return text, nil
		}
		return "", fmt.Errorf("both text and vision extraction failed: text=%v, vision=%v", err, visionErr)
	}

	// Vision extraction succeeded
	return visionText, nil
}

// extractTextFromImages sends images to Groq Vision API and extracts text
func extractTextFromImages(imageURLs []string, groqClient *groq.Client) (string, error) {
	var allText strings.Builder

	for i, imageURL := range imageURLs {
		// Create vision message with image
		content := []groq.ContentPart{
			{
				Type: "text",
				Text: "Extract all text from this CV/resume page. Return ONLY the extracted text, no additional commentary. Preserve the structure and formatting as much as possible.",
			},
			{
				Type: "image_url",
				ImageURL: &groq.ImageURL{
					URL: imageURL,
				},
			},
		}

		req := groq.VisionChatCompletionRequest{
			Messages: []groq.VisionMessage{
				{
					Role:    "user",
					Content: content,
				},
			},
			Model: "qwen/qwen3.6-27b",
		}

		resp, err := groqClient.CreateVisionChatCompletion(req)
		if err != nil {
			// Retry once on failure to handle transient errors
			time.Sleep(500 * time.Millisecond)
			resp, err = groqClient.CreateVisionChatCompletion(req)
			if err != nil {
				return "", fmt.Errorf("vision API failed for page %d: %w", i+1, err)
			}
		}

		if len(resp.Choices) == 0 {
			continue
		}

		pageText := resp.Choices[0].Message.Content
		allText.WriteString(pageText)
		allText.WriteString("\n\n")
	}

	extractedText := strings.TrimSpace(allText.String())
	if len(extractedText) == 0 {
		return "", fmt.Errorf("vision extraction returned empty text")
	}

	return extractedText, nil
}
