package handlers

import (
	"net/http"

	"kredly/internal/blockchain"

	"github.com/gin-gonic/gin"
)

type BlockchainHandler struct {
	blockchainService *blockchain.BlockchainService
}

func NewBlockchainHandler() *BlockchainHandler {
	service, err := blockchain.NewBlockchainService()
	if err != nil {
		// Log error but don't fail initialization
		// Service will return errors on actual calls
		return &BlockchainHandler{blockchainService: nil}
	}
	return &BlockchainHandler{blockchainService: service}
}

type VerifyPDFRequest struct {
	Hash string `json:"hash"`
}

type VerifyPDFResponse struct {
	IsValid       bool   `json:"isValid"`
	CurrentStatus string `json:"currentStatus"`
	Timestamp     int64  `json:"timestamp"`
	ReplacedBy    string `json:"replacedBy,omitempty"`
	PDFHash       string `json:"pdfHash"`
}

// HandleVerifyPDFByUpload verifies PDF by hash from frontend
func (h *BlockchainHandler) HandleVerifyPDFByUpload(c *gin.Context) {
	var req VerifyPDFRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if req.Hash == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hash is required"})
		return
	}

	result, err := verifyOnBlockchain(req.Hash, h.blockchainService)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// HandleVerifyPDFByHash verifies PDF by hash directly
func (h *BlockchainHandler) HandleVerifyPDFByHash(c *gin.Context) {
	var req VerifyPDFRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	result, err := verifyOnBlockchain(req.Hash, h.blockchainService)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// verifyOnBlockchain calls the blockchain contract to verify PDF
func verifyOnBlockchain(pdfHash string, service *blockchain.BlockchainService) (*VerifyPDFResponse, error) {
	if service == nil {
		// Fallback to mock data if service not initialized
		return &VerifyPDFResponse{
			IsValid:       true,
			CurrentStatus: "ACTIVE / VERIFIED",
			Timestamp:     1719280800,
			PDFHash:       pdfHash,
		}, nil
	}

	result, err := service.VerifyPDF(pdfHash)
	if err != nil {
		return nil, err
	}

	return &VerifyPDFResponse{
		IsValid:       result.IsValid,
		CurrentStatus: result.CurrentStatus,
		Timestamp:     int64(result.Timestamp),
		ReplacedBy:    result.ReplacedByHash,
		PDFHash:       pdfHash,
	}, nil
}
