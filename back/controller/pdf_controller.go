package controller

import (
	"io/ioutil"
	"net/http"	
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/kut-ase2024-group4/model"
)

func uploadPdf(c *gin.Context) {
	file, err := c.FormFile("pdf")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ファイルを読み込む	
	fileContent, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer fileContent.Close()

	pdfData, err := ioutil.ReadAll(fileContent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// データベースに保存
	userId := GetSession(c, os.Getenv("LOGIN_USER_ID_KEY"))
	if userId == -1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = model.InsertPdf(file.Filename, pdfData, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
}

func getPdfs(c *gin.Context) {
	userId := GetSession(c, os.Getenv("LOGIN_USER_ID_KEY"))
	if userId == -1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no user"})
		return
	}	

	files := model.GetPdfs(userId)

	var filenames []string
	var fileIds   []int
	for _, file := range files {
		filenames = append(filenames, file.Filename)
		fileIds   = append(fileIds, file.Id)
	}
	c.JSON(http.StatusOK, gin.H{
		"filenames": filenames,
		"fileIds":   fileIds,
	})
}

// 特定のidを持ったpdfをdbから取得して返す関数
// 他のユーザのファイルを見ようとしていないかチェックする気候が必要
/*
func getPdfByUserId(c *gin.Context) 
	userId := GetSession(c, os.Getenv("LOGIN_USER_ID_KEY"))
	pdf := model.GetPdfByUserId(id)
	if pdf.user_id != userId {
		return
	}
	c.JSON(http.StatusOK, pdf)
}
*/