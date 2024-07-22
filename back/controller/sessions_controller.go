package controller

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

var conn *redis.Client

func init() {
	conn = redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",
		DB:       0,
	})
}

func NewSession(c *gin.Context, cookieKey, redisValue string) {
	b := make([]byte, 64)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		panic("ランダムな文字作成時にエラーが発生しました。")
	}
	newRedisKey := base64.URLEncoding.EncodeToString(b)
	if err := conn.Set(c, newRedisKey, redisValue, 0).Err(); err != nil {
		panic("Session登録時にエラーが発生：" + err.Error())
	}
	c.SetCookie(cookieKey, newRedisKey, 3600, "/", "localhost", false, false)
}

// getSessionなんて名前にしたけど，これただのgetUserIdやわ
func GetSession(c *gin.Context, cookieKey string) int {
	redisKey, _ := c.Cookie(cookieKey)
	redisValue, err := conn.Get(c, redisKey).Result()

	switch {
	case err == redis.Nil:
		fmt.Println("SessionKeyが登録されていません。")
		return -1
	case err != nil:
		fmt.Println("Session取得時にエラー発生: " + err.Error())
		return -1
	}

	userId, err := strconv.Atoi(redisValue)
	if err != nil {
		log.Printf("Failed to convert redisValueStr to int: %v", err)
		return -1
	}

	return userId
}

func DeleteSession(c *gin.Context, cookieKey string) {
	redisId, _ := c.Cookie(cookieKey)
	conn.Del(c, redisId)
	c.SetCookie(cookieKey, "", -1, "/", "localhost", false, false)
}
