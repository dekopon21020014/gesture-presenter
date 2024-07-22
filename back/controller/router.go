package controller

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func GetRouter() *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"}, // フロントエンドのオリジン
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Cookie"},
        AllowCredentials: true,
    }))

	router.LoadHTMLGlob("view/*.html")

	router.GET("/", getTop)
	router.GET("/verify-token", verifyToken)
	router.POST("/api/pdf", uploadPdf)

	loginCheckGroup := router.Group("/", checkLogin())
	{
		loginCheckGroup.GET("/mypage", getMypage)
		loginCheckGroup.GET("/logout", getLogout)		
	}
	logoutCheckGroup := router.Group("/", checkLogout())
	{
		logoutCheckGroup.GET("/signup", getSignup)
		logoutCheckGroup.POST("/signup", postSignup)
		logoutCheckGroup.GET("/login", getLogin)
		logoutCheckGroup.POST("/login", postLogin)
	}

	return router
}

func checkLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
		id := GetSession(c, cookieKey)
		if id < 0 {
			c.Redirect(http.StatusFound, "/login")
			c.Abort()
		} else {
			c.Next()
		}
	}
}

func checkLogout() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
		id := GetSession(c, cookieKey)
		if id > 0 {
			c.Redirect(http.StatusFound, "/")
			c.Abort()
		} else {
			c.Next()
		}
	}
}

func verifyToken(c *gin.Context) {
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	id := GetSession(c, cookieKey)
	if id < 0 { // no session
		c.JSON(http.StatusUnauthorized, gin.H{"message": "401: Unauthorized"})
	} else { // authenticated
		c.JSON(http.StatusOK, gin.H{"message": "200: Authorized"})
	}
}
