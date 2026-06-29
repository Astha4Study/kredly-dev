package handlers

import (
	"context"
	"kredly/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ActivityHandler struct {
	db *mongo.Database
}

func NewActivityHandler(db *mongo.Database) *ActivityHandler {
	return &ActivityHandler{
		db: db,
	}
}

func (h *ActivityHandler) GetUserActivities(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	userMap, ok := user.(gin.H)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user data"})
		return
	}

	userID, ok := userMap["id"].(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	// Sort by createdAt descending (newest first)
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := h.db.Collection("activity").Find(
		context.Background(),
		bson.M{"userId": userID},
		opts,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	var activities []models.Activity
	if err = cursor.All(context.Background(), &activities); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return empty array if no activities found (not an error)
	if activities == nil {
		activities = []models.Activity{}
	}

	c.JSON(http.StatusOK, activities)
}
