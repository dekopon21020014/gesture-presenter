# Gesture Presenter
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)

## Overview
- This project uses Next.js for the frontend and Go for the backend.

### Features

- **Next.js**: A React framework for production.
- **Go**: An open-source programming language that makes it easy to build simple, reliable, and efficient software.

## Prerequisites

Make sure you have the following software installed on your machine:

- Node.js 18.17.1
- Go 1.22.1

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/kut-ase2024-group4/gesture-presenter.git
cd gesture presenter
docker compose run -w /app --rm front npm install
docker compose up
```

### apiのメモ
```
# file-> 自分のスライド
# ref-> 参考にするスライド (複数可能)
# curl -X POST "http://localhost:8001/analyze-slide" -H "accept: application/json" -F "file=@/path/to/own_slide.pdf" -F "ref=@/path/to/ref_slide.pdf"


# curl -X POST "http://localhost:8001/analyze-slide" -H "accept: application/json" -F "file=@/path/to/slide.pdf"
# curl -X POST "http://localhost:8001/analyze-voice" -H "accept: application/json" -F "file=@/path/to/audio.webm"
# こんな感じで，リクエストを出すと
# {
#   "gemini_response": "このスライド------------です．"
# }


# curl -X POST "http://localhost:8001/analyze-slide" -H "accept: application/json" -F "file=@`pwd`/readable_code.pdf"
```