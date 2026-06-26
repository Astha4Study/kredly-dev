package blockchain

import (
	"fmt"
	"os"
)

// BlockchainService is a wrapper around CertificateClient for backward compatibility
// Deprecated: Use CertificateClient directly instead
type BlockchainService struct {
	client *CertificateClient
}

// NewBlockchainService creates a new blockchain service using environment variables
// Deprecated: Use NewCertificateClient directly instead
func NewBlockchainService() (*BlockchainService, error) {
	rpcURL := os.Getenv("BLOCKCHAIN_RPC_URL")
	contractAddr := os.Getenv("BLOCKCHAIN_CONTRACT_ADDRESS")
	privateKey := os.Getenv("BLOCKCHAIN_PRIVATE_KEY")

	if rpcURL == "" || contractAddr == "" {
		return nil, fmt.Errorf("blockchain configuration not set")
	}

	client, err := NewCertificateClient(rpcURL, contractAddr, privateKey)
	if err != nil {
		return nil, err
	}

	return &BlockchainService{
		client: client,
	}, nil
}

// VerifyPDF is deprecated - use VerifyCertificate instead
// This method is kept for backward compatibility but will return an error
func (b *BlockchainService) VerifyPDF(pdfHash string) (*VerificationResult, error) {
	return nil, fmt.Errorf("VerifyPDF is deprecated, use VerifyCertificate(certificateID, pdfHash) instead")
}

// RegisterPDF is deprecated - use IssueCertificate instead
// This method is kept for backward compatibility but will return an error
func (b *BlockchainService) RegisterPDF(pdfHash string) (string, error) {
	return "", fmt.Errorf("RegisterPDF is deprecated, use IssueCertificate(certificateID, pdfHash, ipfsCID) instead")
}

// GetClient returns the underlying CertificateClient
func (b *BlockchainService) GetClient() *CertificateClient {
	return b.client
}

// Close closes the blockchain connection
func (b *BlockchainService) Close() {
	if b.client != nil {
		b.client.Close()
	}
}
