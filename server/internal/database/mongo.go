package database

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DB adalah instance database global yang bisa dipanggil dari package lain
var DB *mongo.Database

// ConnectDB membuka koneksi ke MongoDB dan menginisialisasi variabel DB
func ConnectDB(databaseURL string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Konfigurasi Client
	clientOptions := options.Client().ApplyURI(databaseURL)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("❌ Gagal membuat koneksi MongoDB: %v", err)
	}

	// Lakukan Ping untuk memastikan database benar-benar bisa dihubungi
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("❌ Gagal melakukan Ping ke MongoDB: %v", err)
	}

	fmt.Println("✅ Berhasil terhubung ke MongoDB!")

	// Extract database name dari URL
	dbName := extractDBName(databaseURL)
	DB = client.Database(dbName)
}

// extractDBName mengekstrak nama database dari connection string
func extractDBName(url string) string {
	// Format: mongodb://host:port/dbname atau mongodb+srv://host/dbname
	if strings.Contains(url, "?") {
		url = strings.Split(url, "?")[0]
	}
	parts := strings.Split(url, "/")
	if len(parts) > 3 {
		return parts[len(parts)-1]
	}
	return "kredly" // fallback default
}
