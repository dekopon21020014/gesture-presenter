package model

import (
	"gorm.io/gorm"
)

type PDF struct {
	gorm.Model
	Id       int
	Filename string `gorm:"not null"`
	Content  []byte `gorm:"not null"`
	UserId   int    `gorm:"not null"`
}

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

func GetPdfs(userId int) []PDF {
	var files []PDF
	Db.Where("user_id = ?", userId).Select("id", "filename").Find(&files)
	return files
}