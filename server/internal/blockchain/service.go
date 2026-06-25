package blockchain

import (
	"context"
	"encoding/hex"
	"fmt"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const contractABI = `[{"inputs":[{"internalType":"bytes32","name":"_pdfHash","type":"bytes32"}],"name":"verifyPDF","outputs":[{"internalType":"bool","name":"isValid","type":"bool"},{"internalType":"string","name":"currentStatus","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bytes32","name":"replacedByHash","type":"bytes32"}],"stateMutability":"view","type":"function"}]`

type BlockchainService struct {
	client          *ethclient.Client
	contractAddress common.Address
	contractABI     abi.ABI
	rpcURL          string
}

func NewBlockchainService() (*BlockchainService, error) {
	rpcURL := os.Getenv("BLOCKCHAIN_RPC_URL")
	contractAddr := os.Getenv("BLOCKCHAIN_CONTRACT_ADDRESS")

	if rpcURL == "" || contractAddr == "" {
		return nil, fmt.Errorf("blockchain configuration not set")
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to blockchain: %w", err)
	}

	parsedABI, err := abi.JSON(strings.NewReader(contractABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse ABI: %w", err)
	}

	return &BlockchainService{
		client:          client,
		contractAddress: common.HexToAddress(contractAddr),
		contractABI:     parsedABI,
		rpcURL:          rpcURL,
	}, nil
}

func (b *BlockchainService) VerifyPDF(pdfHash string) (*VerificationResult, error) {
	hashBytes := common.HexToHash(pdfHash)

	var (
		isValid        bool
		currentStatus  string
		timestamp      *big.Int
		replacedByHash [32]byte
	)

	callData, err := b.contractABI.Pack("verifyPDF", hashBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to pack data: %w", err)
	}

	msg := ethereum.CallMsg{
		To:   &b.contractAddress,
		Data: callData,
	}

	result, err := b.client.CallContract(context.Background(), msg, nil)
	if err != nil {
		return nil, fmt.Errorf("contract call failed: %w", err)
	}

	outputs := []interface{}{&isValid, &currentStatus, &timestamp, &replacedByHash}
	err = b.contractABI.UnpackIntoInterface(&outputs, "verifyPDF", result)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack result: %w", err)
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

func (b *BlockchainService) RegisterPDF(pdfHash string) (string, error) {
	privateKeyHex := os.Getenv("BLOCKCHAIN_PRIVATE_KEY")
	if privateKeyHex == "" {
		return "", fmt.Errorf("private key not configured")
	}

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return "", fmt.Errorf("invalid private key: %w", err)
	}

	chainID, err := b.client.NetworkID(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get chain ID: %w", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return "", fmt.Errorf("failed to create transactor: %w", err)
	}

	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(300000)

	// TODO: Implement actual transaction
	return "0x0000000000000000000000000000000000000000000000000000000000000000", nil
}

func (b *BlockchainService) Close() {
	if b.client != nil {
		b.client.Close()
	}
}
