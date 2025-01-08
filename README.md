# Gesture Presenter
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-FF5733?style=for-the-badge&logo=gemini&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Overview
- This project uses Next.js for the frontend and FastAPI for the backend.

## Prerequisites

Make sure you have the following software installed on your machine:

- Node.js 18.17.1
- python 3.11-slim

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/dekopon21020014/gesture-presenter.git
cd gesture-presenter
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