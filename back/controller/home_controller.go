package controller

import (
	"github.com/kut-ase2024-group4/model"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func getMypage(c *gin.Context) {
	user := model.User{}
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	userId := GetSession(c, cookieKey)

	userPtr, err := model.GetUserByID(userId)
	if err != nil || userPtr == nil {
		log.Printf("Failed to get user by id = %d, err = %v", userId, err)
		c.HTML(http.StatusOK, "mypage.html", gin.H{"user": user})
		return
	}

	user = *userPtr
	c.HTML(http.StatusOK, "mypage.html", gin.H{"user": user})
}

func getTop(c *gin.Context) {
	user := model.User{}
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	userId := GetSession(c, cookieKey)

	userPtr, err := model.GetUserByID(userId)
	if err != nil || userPtr == nil {
		log.Printf("Failed to get user by id = %d, err = %v", userId, err)
		c.HTML(http.StatusOK, "home.html", gin.H{"user": user})
		return
	}

	user = *userPtr
	c.HTML(http.StatusOK, "home.html", gin.H{"user": user})
}
