package model

import (
	"gorm.io/gorm"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
)

type PDF struct {
	gorm.Model
	Id       int
	Filename string `gorm:"not null"`
	Filepath string `gorm:"not null"`
	UserId   int    `gorm:"not null"`
}

/*
func InsertPdf(filename string, content []byte, userId int) error {
	pdf := PDF{
		Filename: filename,
		Content:  content,
		UserId: userId,
	}

	result := Db.Create(&pdf)
	if result.Error != nil {
		return result.Error
	}

	return nil
}
*/

// InsertPdf はファイルシステムにPDFを保存
const uploadDir = "./uploads"
func InsertPdf(filename string, content []byte, userId int) error {
	userIdStr := strconv.Itoa(userId)
    filePath := filepath.Join(uploadDir, userIdStr, filename)

	// ディレクトリが存在しない場合は作成する
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return fmt.Errorf("failed to create directories: %w", err)
	}

	// ファイルシステムにPDFファイルを書き込む
	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	_, err = file.Write(content)
	if err != nil {
		return fmt.Errorf("failed to write to file: %w", err)
	}

	// PDF情報をデータベースに保存
	pdf := PDF{
		Filename: filename,
		Filepath: filePath, // 保存されたファイルのパス
		UserId:   userId,
	}

	result := Db.Create(&pdf)
	if result.Error != nil {		
		fmt.Println(result.Error)
		return result.Error
	}
	return nil
}



func GetPdfs(userId int) []PDF {
	var files []PDF
	Db.Where("user_id = ?", userId).Select("id", "filename").Find(&files)
	return files
}

func GetPresentation(id int) (*PDF, error) {
	var pdf PDF
	result := Db.Where("id = ?", id).Select("id, filename, filepath, user_id").First(&pdf)
	if result.Error != nil {
		return nil, result.Error
	}
	fmt.Println(pdf.UserId)
	return &pdf, nil
}
