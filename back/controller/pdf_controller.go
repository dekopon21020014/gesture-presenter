package controller

import (
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	//"fmt"

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
	var fileIds []int
	for _, file := range files {
		filenames = append(filenames, file.Filename)
		fileIds = append(fileIds, file.Id)
	}
	c.JSON(http.StatusOK, gin.H{
		"filenames": filenames,
		"fileIds":   fileIds,
	})
}

func getPdfById(c *gin.Context) {
	// クエリパラメータやURLパラメータからIDを取得する
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// セッションからユーザーIDを取得する
	/*
		userId := GetSession(c, os.Getenv("LOGIN_USER_ID_KEY"))
		if userId == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
	*/

	// 指定されたIDのPDFを取得する
	pdf, err := model.GetPresentation(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// PDFの所有者が現在のユーザーであることを確認する
	/*
		if pdf.UserId != userId {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			return
		}
	*/

	// PDFの情報をJSON形式で返す
	// c.JSON(http.StatusOK, pdf)
	/*
		c.JSON(http.StatusOK, gin.H{
			"id":       pdf.ID,
			"filename": pdf.Filename,
			"content":  pdf.Content,
			"userId":   pdf.UserId,
		})
	*/
	filePath := pdf.Filepath
	// ファイルを返す
	c.File(filePath)
}
