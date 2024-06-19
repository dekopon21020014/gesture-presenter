package controller

import (
	"os"
	"net/http"
	"log"
	"github.com/kut-ase2024-group4/model"

	"github.com/gin-gonic/gin"
)
/*
func getTop(c *gin.Context) {
	c.HTML(http.StatusOK, "home.html", nil)
}
*/

func getMypage(c *gin.Context) {
    user := model.User{}
    cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
    userId := GetSession(c, cookieKey)
    
    if userId != nil {
        // 型アサーションを使用してinterface{}をuintに変換
        if uid, ok := userId.(uint); ok {
            // model.GetUserByIDが*model.User型を返す場合
            if userPtr, err := model.GetUserByID(uid); err == nil && userPtr != nil {
                user = *userPtr
            } else {
                // エラーハンドリング（必要に応じてエラーログを出力）
                log.Printf("Failed to get user by ID: %v", err)
            }
        } else {
            // userIdがuintに変換できない場合のエラーハンドリング
            log.Printf("userId is not of type uint")
        }
    }

    c.HTML(http.StatusOK, "mypage.html", gin.H{"user": user})
}


func getTop(c *gin.Context) {
	user := model.User{}
	cookieKey := os.Getenv("LOGIN_USER_ID_KEY")
	userId := GetSession(c, cookieKey)	
	if uid, ok := userId.(uint); ok {
		if userPtr, err := model.GetUserByID(uid); err == nil && userPtr != nil {
			user = *userPtr
		}
	}

	c.HTML(http.StatusOK, "home.html", gin.H{
		"user": user,
	})
}