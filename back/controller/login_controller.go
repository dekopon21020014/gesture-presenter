package controller

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/kut-ase2024-group4/model"
)

type User struct {
    Email    string `json:"email"`
    Name     string `json:"name"`
    Password string `json:"password"`
}

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func getSignup(c *gin.Context) {
	c.HTML(http.StatusOK, "signup.html", nil)
}

func postSignup(c *gin.Context) {	
	var request User
    // JSONデータをパース
    if err := c.BindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return		
    }

	user, err := model.Signup(request.Email, request.Name, request.Password)
	if err != nil {
		c.Redirect(301, "/signup")
		return
	}
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	NewSession(c, cookieKey, strconv.FormatUint(uint64(user.ID), 10))
	c.JSON(http.StatusOK, gin.H{"message": "this message from c.JSON()"})
}

func getLogin(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", nil)
}

func postLogin(c *gin.Context) {
	var request User
    // JSONデータをパース
    if err := c.BindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

	user, err := model.Login(request.Email, request.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "401: Unauthorized"})
		return
	}
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	NewSession(c, cookieKey, strconv.FormatUint(uint64(user.ID), 10))
	c.JSON(http.StatusOK, gin.H{"message": "loged in successfully"})
}

func getLogout(c *gin.Context) {
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	DeleteSession(c, cookieKey)
	c.JSON(http.StatusOK, gin.H{"message": "session is deleted"})
}
