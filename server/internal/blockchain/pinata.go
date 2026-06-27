package blockchain

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

const (
	PinataAPIURL     = "https://api.pinata.cloud/pinning/pinFileToIPFS"
	PinataGatewayURL = "https://gateway.pinata.cloud/ipfs"
)

type PinataUploadResponse struct {
	IpfsHash  string    `json:"IpfsHash"`
	PinSize   int64     `json:"PinSize"`
	Timestamp time.Time `json:"Timestamp"`
}

type PinataMetadata struct {
	Name      string                 `json:"name"`
	KeyValues map[string]interface{} `json:"keyvalues,omitempty"`
}

type PinataClient struct {
	apiKey string
}

func NewPinataClient() *PinataClient {
	jwt := os.Getenv("PINATA_JWT")
	if jwt == "" {
		return nil
	}
	return &PinataClient{apiKey: jwt}
}

// UploadPDF uploads PDF buffer to Pinata IPFS
func (p *PinataClient) UploadPDF(pdfBuffer []byte, filename string) (string, error) {
	if p == nil {
		return "", fmt.Errorf("Pinata client not initialized - check PINATA_JWT")
	}

	// Create multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add PDF file
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := part.Write(pdfBuffer); err != nil {
		return "", fmt.Errorf("failed to write PDF buffer: %w", err)
	}

	// Add metadata
	metadata := PinataMetadata{
		Name: filename,
		KeyValues: map[string]interface{}{
			"type":      "certificate",
			"timestamp": time.Now().Format(time.RFC3339),
		},
	}
	metadataJSON, _ := json.Marshal(metadata)
	if err := writer.WriteField("pinataMetadata", string(metadataJSON)); err != nil {
		return "", fmt.Errorf("failed to add metadata: %w", err)
	}

	writer.Close()

	// Create request
	req, err := http.NewRequest("POST", PinataAPIURL, body)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+p.apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to upload to Pinata: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Pinata upload failed with status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parse response
	var uploadResp PinataUploadResponse
	if err := json.NewDecoder(resp.Body).Decode(&uploadResp); err != nil {
		return "", fmt.Errorf("failed to decode Pinata response: %w", err)
	}

	return uploadResp.IpfsHash, nil
}

// GetIPFSUrl returns the gateway URL for an IPFS CID
func GetIPFSUrl(cid string) string {
	return fmt.Sprintf("%s/%s", PinataGatewayURL, cid)
}
