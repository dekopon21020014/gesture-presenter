package controller

import (
	"github.com/gin-gonic/gin"
)

func GetRouter() *gin.Engine {
	router := gin.Default()
	router.LoadHTMLGlob("view/*.html")

	router.GET("/", getTop)
	router.GET("/signup", getSignup)
	router.POST("/signup", postSignup)
	router.GET("/login", getLogin)
	router.POST("/login", postLogin)

	return router
}
