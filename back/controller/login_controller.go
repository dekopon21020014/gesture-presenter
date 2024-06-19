package controller

import (	
	"net/http"
	"os"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/kut-ase2024-group4/model"
)

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
	email := c.PostForm("email")
	name := c.PostForm("name")
	pw := c.PostForm("password")
	user, err := model.Signup(email, name, pw)
	if err != nil {
		c.Redirect(301, "/signup")
		return
	}
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	print("get env = ", cookieKey)
	NewSession(c, cookieKey, strconv.FormatUint(uint64(user.ID), 10))
	c.Redirect(http.StatusFound, "/")
}

func getLogin(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", nil)
}

func postLogin(c *gin.Context) {
	email := c.PostForm("email")
	pw := c.PostForm("password")

	user, err := model.Login(email, pw)
	if err != nil {
		c.Redirect(301, "/login")
		return
	}
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	NewSession(c, cookieKey, string(user.ID))
	c.Redirect(http.StatusFound, "/")
}

func getLogout(c *gin.Context) {
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	DeleteSession(c, cookieKey)
	c.Redirect(http.StatusFound, "/login")
}