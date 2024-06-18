package main

import (
	"github.com/kut-ase2024-group4/controller"
)


func main() {
	router := controller.GetRouter()
	router.Run()
}