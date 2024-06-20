package controller

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func GetRouter() *gin.Engine {
	router := gin.Default()
	router.Use(cors.Default())
	router.LoadHTMLGlob("view/*.html")

	router.GET("/", getTop)

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
