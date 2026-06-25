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

const PDFRegistryABI = `[
	{
		"inputs": [{"internalType": "bytes32","name": "_pdfHash","type": "bytes32"}],
		"name": "registerPDF",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{"internalType": "bytes32","name": "_pdfHash","type": "bytes32"}],
		"name": "verifyPDF",
		"outputs": [
			{"internalType": "bool","name": "isValid","type": "bool"},
			{"internalType": "string","name": "currentStatus","type": "string"},
			{"internalType": "uint256","name": "timestamp","type": "uint256"},
			{"internalType": "bytes32","name": "replacedByHash","type": "bytes32"}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`

type VerificationResult struct {
	IsValid        bool   `json:"isValid"`
	CurrentStatus  string `json:"currentStatus"`
	Timestamp      uint64 `json:"timestamp"`
	ReplacedByHash string `json:"replacedByHash"`
}

type PDFRegistryClient struct {
	client          *ethclient.Client
	contract        *bind.BoundContract
	contractAddress common.Address
	privateKey      *ecdsa.PrivateKey
	publicAddress   common.Address
}

func NewPDFRegistryClient(rpcURL, contractAddress, privateKeyHex string) (*PDFRegistryClient, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to ethereum client: %w", err)
	}

	parsedABI, err := abi.JSON(strings.NewReader(PDFRegistryABI))
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

	return &PDFRegistryClient{
		client:          client,
		contract:        contract,
		contractAddress: address,
		privateKey:      privateKey,
		publicAddress:   publicAddress,
	}, nil
}

func (p *PDFRegistryClient) HashPDFContent(content []byte) string {
	hash := sha256.Sum256(content)
	return "0x" + hex.EncodeToString(hash[:])
}

func (p *PDFRegistryClient) VerifyPDF(pdfHash string) (*VerificationResult, error) {
	hashBytes := common.HexToHash(pdfHash)

	var (
		isValid        bool
		currentStatus  string
		timestamp      *big.Int
		replacedByHash [32]byte
	)

	results := []interface{}{&isValid, &currentStatus, &timestamp, &replacedByHash}

	err := p.contract.Call(&bind.CallOpts{}, &results, "verifyPDF", hashBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to verify PDF: %w", err)
	}

	replacedBy := ""
	if replacedByHash != [32]byte{} {
		replacedBy = "0x" + hex.EncodeToString(replacedByHash[:])
	}

	return &VerificationResult{
		IsValid:        isValid,
		CurrentStatus:  currentStatus,
		Timestamp:      timestamp.Uint64(),
		ReplacedByHash: replacedBy,
	}, nil
}

func (p *PDFRegistryClient) RegisterPDF(pdfHash string) (string, error) {
	hashBytes := common.HexToHash(pdfHash)

	chainID, err := p.client.NetworkID(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get chain ID: %w", err)
	}

	nonce, err := p.client.PendingNonceAt(context.Background(), p.publicAddress)
	if err != nil {
		return "", fmt.Errorf("failed to get nonce: %w", err)
	}

	gasPrice, err := p.client.SuggestGasPrice(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get gas price: %w", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(p.privateKey, chainID)
	if err != nil {
		return "", fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000)
	auth.GasPrice = gasPrice

	tx, err := p.contract.Transact(auth, "registerPDF", hashBytes)
	if err != nil {
		return "", fmt.Errorf("failed to register PDF: %w", err)
	}

	return tx.Hash().Hex(), nil
}

func (p *PDFRegistryClient) RevokePDF(pdfHash string) (string, error) {
	hashBytes := common.HexToHash(pdfHash)

	chainID, err := p.client.NetworkID(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get chain ID: %w", err)
	}

	nonce, err := p.client.PendingNonceAt(context.Background(), p.publicAddress)
	if err != nil {
		return "", fmt.Errorf("failed to get nonce: %w", err)
	}

	gasPrice, err := p.client.SuggestGasPrice(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get gas price: %w", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(p.privateKey, chainID)
	if err != nil {
		return "", fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000)
	auth.GasPrice = gasPrice

	tx, err := p.contract.Transact(auth, "revokePDF", hashBytes)
	if err != nil {
		return "", fmt.Errorf("failed to revoke PDF: %w", err)
	}

	return tx.Hash().Hex(), nil
}

func (p *PDFRegistryClient) Close() {
	if p.client != nil {
		p.client.Close()
	}
}
