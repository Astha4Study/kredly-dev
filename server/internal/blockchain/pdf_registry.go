package blockchain

import (
	"context"
	"crypto/ecdsa"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const KredlyCertificateABI = `[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"CertificateAlreadyExists","type":"error"},{"inputs":[],"name":"CertificateAlreadyRevoked","type":"error"},{"inputs":[],"name":"CertificateNotExists","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"certificateId","type":"string"},{"indexed":false,"internalType":"bytes32","name":"pdfHash","type":"bytes32"},{"indexed":false,"internalType":"string","name":"ipfsCID","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CertificateIssued","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"certificateId","type":"string"},{"indexed":false,"internalType":"string","name":"reason","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"CertificateRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"certificates","outputs":[{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"bytes32","name":"pdfHash","type":"bytes32"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"issuedAt","type":"uint256"},{"internalType":"bool","name":"isRevoked","type":"bool"},{"internalType":"string","name":"revokeReason","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"}],"name":"getCertificate","outputs":[{"components":[{"internalType":"string","name":"certificateId","type":"string"},{"internalType":"bytes32","name":"pdfHash","type":"bytes32"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"uint256","name":"issuedAt","type":"uint256"},{"internalType":"bool","name":"isRevoked","type":"bool"},{"internalType":"string","name":"revokeReason","type":"string"}],"internalType":"struct KredlyCertificate.Certificate","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"bytes32","name":"_pdfHash","type":"bytes32"},{"internalType":"string","name":"_ipfsCID","type":"string"}],"name":"issueCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"string","name":"_reason","type":"string"}],"name":"revokeCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_certificateId","type":"string"},{"internalType":"bytes32","name":"_pdfHash","type":"bytes32"}],"name":"verifyCertificate","outputs":[{"internalType":"bool","name":"isValid","type":"bool"},{"internalType":"enum KredlyCertificate.VerifyStatus","name":"status","type":"uint8"}],"stateMutability":"view","type":"function"}]`

// VerifyStatus enum: 0=Valid, 1=NotFound, 2=Revoked, 3=HashMismatch
type VerifyStatus uint8

const (
	VerifyStatusValid        VerifyStatus = 0
	VerifyStatusNotFound     VerifyStatus = 1
	VerifyStatusRevoked      VerifyStatus = 2
	VerifyStatusHashMismatch VerifyStatus = 3
)

func (v VerifyStatus) String() string {
	switch v {
	case VerifyStatusValid:
		return "Valid"
	case VerifyStatusNotFound:
		return "NotFound"
	case VerifyStatusRevoked:
		return "Revoked"
	case VerifyStatusHashMismatch:
		return "HashMismatch"
	default:
		return "Unknown"
	}
}

type Certificate struct {
	CertificateID string   `json:"certificateId"`
	PdfHash       [32]byte `json:"pdfHash"`
	IpfsCID       string   `json:"ipfsCID"`
	IssuedAt      uint64   `json:"issuedAt"`
	IsRevoked     bool     `json:"isRevoked"`
	RevokeReason  string   `json:"revokeReason"`
}

type VerificationResult struct {
	IsValid bool         `json:"isValid"`
	Status  VerifyStatus `json:"status"`
}

type CertificateClient struct {
	client          *ethclient.Client
	contract        *bind.BoundContract
	contractAddress common.Address
	privateKey      *ecdsa.PrivateKey
	publicAddress   common.Address
}

func NewCertificateClient(rpcURL, contractAddress, privateKeyHex string) (*CertificateClient, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to ethereum client: %w", err)
	}

	parsedABI, err := abi.JSON(strings.NewReader(KredlyCertificateABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse contract ABI: %w", err)
	}

	address := common.HexToAddress(contractAddress)
	contract := bind.NewBoundContract(address, parsedABI, client, client, client)

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("failed to cast public key to ECDSA")
	}

	publicAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	return &CertificateClient{
		client:          client,
		contract:        contract,
		contractAddress: address,
		privateKey:      privateKey,
		publicAddress:   publicAddress,
	}, nil
}

// Backward compatibility alias
type PDFRegistryClient = CertificateClient

func NewPDFRegistryClient(rpcURL, contractAddress, privateKeyHex string) (*PDFRegistryClient, error) {
	return NewCertificateClient(rpcURL, contractAddress, privateKeyHex)
}

// HashPDFContent calculates SHA256 hash of PDF content
func (c *CertificateClient) HashPDFContent(content []byte) string {
	hash := sha256.Sum256(content)
	return "0x" + hex.EncodeToString(hash[:])
}

// HashPDFContentBytes returns hash as [32]byte for contract calls
func (c *CertificateClient) HashPDFContentBytes(content []byte) [32]byte {
	return sha256.Sum256(content)
}

// IssueCertificate issues a new certificate on blockchain
func (c *CertificateClient) IssueCertificate(certificateID, pdfHash, ipfsCID string) (string, error) {
	hashBytes := common.HexToHash(pdfHash)

	chainID, err := c.client.NetworkID(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get chain ID: %w", err)
	}

	nonce, err := c.client.PendingNonceAt(context.Background(), c.publicAddress)
	if err != nil {
		return "", fmt.Errorf("failed to get nonce: %w", err)
	}

	gasPrice, err := c.client.SuggestGasPrice(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get gas price: %w", err)
	}

	// Cap gas price to reasonable amount (50 Gwei for testnet)
	// ponytail: Prevents absurd gas prices. Minimum is 25 Gwei, we set 50 Gwei as safe buffer.
	maxGasPrice := big.NewInt(50_000_000_000) // 50 Gwei
	if gasPrice.Cmp(maxGasPrice) > 0 {
		gasPrice = maxGasPrice
	}
	// Ensure minimum 25 Gwei
	minGasPrice := big.NewInt(25_000_000_000) // 25 Gwei
	if gasPrice.Cmp(minGasPrice) < 0 {
		gasPrice = minGasPrice
	}

	auth, err := bind.NewKeyedTransactorWithChainID(c.privateKey, chainID)
	if err != nil {
		return "", fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(500000) // Increased for string storage
	auth.GasPrice = gasPrice

	tx, err := c.contract.Transact(auth, "issueCertificate", certificateID, hashBytes, ipfsCID)
	if err != nil {
		return "", fmt.Errorf("failed to issue certificate: %w", err)
	}

	return tx.Hash().Hex(), nil
}

// VerifyCertificate verifies a certificate by ID and PDF hash
func (c *CertificateClient) VerifyCertificate(certificateID, pdfHash string) (*VerificationResult, error) {
	hashBytes := common.HexToHash(pdfHash)

	var out []interface{}

	err := c.contract.Call(&bind.CallOpts{}, &out, "verifyCertificate", certificateID, hashBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to verify certificate: %w", err)
	}

	if len(out) != 2 {
		return nil, fmt.Errorf("unexpected result length: %d", len(out))
	}

	isValid, ok := out[0].(bool)
	if !ok {
		return nil, fmt.Errorf("invalid isValid type")
	}

	statusUint, ok := out[1].(uint8)
	if !ok {
		return nil, fmt.Errorf("invalid status type")
	}

	return &VerificationResult{
		IsValid: isValid,
		Status:  VerifyStatus(statusUint),
	}, nil
}

// GetCertificate retrieves full certificate data from blockchain
func (c *CertificateClient) GetCertificate(certificateID string) (*Certificate, error) {
	var result struct {
		CertificateID string
		PdfHash       [32]byte
		IpfsCID       string
		IssuedAt      *big.Int
		IsRevoked     bool
		RevokeReason  string
	}

	err := c.contract.Call(&bind.CallOpts{}, &[]interface{}{&result}, "getCertificate", certificateID)
	if err != nil {
		return nil, fmt.Errorf("failed to get certificate: %w", err)
	}

	// Check if certificate exists (issuedAt == 0 means not found)
	if result.IssuedAt.Uint64() == 0 {
		return nil, fmt.Errorf("certificate not found")
	}

	return &Certificate{
		CertificateID: result.CertificateID,
		PdfHash:       result.PdfHash,
		IpfsCID:       result.IpfsCID,
		IssuedAt:      result.IssuedAt.Uint64(),
		IsRevoked:     result.IsRevoked,
		RevokeReason:  result.RevokeReason,
	}, nil
}

// RevokeCertificate revokes a certificate with a reason
func (c *CertificateClient) RevokeCertificate(certificateID, reason string) (string, error) {
	chainID, err := c.client.NetworkID(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get chain ID: %w", err)
	}

	nonce, err := c.client.PendingNonceAt(context.Background(), c.publicAddress)
	if err != nil {
		return "", fmt.Errorf("failed to get nonce: %w", err)
	}

	gasPrice, err := c.client.SuggestGasPrice(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get gas price: %w", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(c.privateKey, chainID)
	if err != nil {
		return "", fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000)
	auth.GasPrice = gasPrice

	tx, err := c.contract.Transact(auth, "revokeCertificate", certificateID, reason)
	if err != nil {
		return "", fmt.Errorf("failed to revoke certificate: %w", err)
	}

	return tx.Hash().Hex(), nil
}

// Backward compatibility methods
func (c *CertificateClient) RegisterPDF(pdfHash string) (string, error) {
	return "", fmt.Errorf("RegisterPDF is deprecated, use IssueCertificate instead")
}

func (c *CertificateClient) VerifyPDF(pdfHash string) (*VerificationResult, error) {
	return nil, fmt.Errorf("VerifyPDF is deprecated, use VerifyCertificate instead")
}

func (c *CertificateClient) RevokePDF(pdfHash string) (string, error) {
	return "", fmt.Errorf("RevokePDF is deprecated, use RevokeCertificate instead")
}

func (c *CertificateClient) Close() {
	if c.client != nil {
		c.client.Close()
	}
}
