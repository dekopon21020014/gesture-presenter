package model

import (
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/kut-ase2024-group4/crypto"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type User struct {
    gorm.Model
    Password string `gorm:"not null"`
    Name     string `gorm:"not null"`
    Email    string `gorm:"not null;unique"`
}

var Db *gorm.DB

func init() {
	// Initialize the database connection
	dsn := "user:user_password@tcp(127.0.0.1:3306)/gesture-presenter?charset=utf8mb4&parseTime=True&loc=Local"
	var err error
	Db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
		os.Exit(1)
	}

	// Migrate the schema
	Db.Set("gorm:table_options", "ENGINE=InnoDB").AutoMigrate(&User{})
}

func (u *User) LoggedIn() bool {
	return u.ID != 0
}

// for user sign up
func Signup(email, name, password string) (*User, error) {	
	user := User{}
	Db.Where("name = ?", name).First(&user)
	if user.ID != 0 {
		err := errors.New("同一名のUserIdが既に登録されています。")
		fmt.Println(err)
		return nil, err		
	}
	
	encryptPw, err := crypto.PasswordEncrypt(password)
	if err != nil {
		fmt.Println("パスワード暗号化中にエラーが発生しました。：", err)
		return nil, err
	}
	
	user = User{
		Password: encryptPw, 
		Name: name, 
		Email: email,
	}
	
	result := Db.Create(&user)
	if result.Error != nil {
    	fmt.Println("エラー:", result.Error)
	}
	return &user, nil
}

func Login(email, password string) (*User, error) {
	user := User{}
	Db.Where("email = ?", email).First(&user)
	fmt.Println(email)
	if user.Email == "" {
		err := errors.New("UserIdが一致するユーザーが存在しません。")
		fmt.Println(err)
		return nil, err
	}

	err := crypto.CompareHashAndPassword(user.Password, password)
	if err != nil {
		fmt.Println("パスワードが一致しませんでした。：", err)
		return nil, err
	}

	return &user, nil
}

func GetUserByID(id uint) (*User, error) {
	var user User
	result := Db.Where("id = ?", id).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}
