# config/settings.py

from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    CUDA_VISIBLE_DEVICES = "-1"
    TEMP_DIR = "temp"
    ALLOWED_ORIGINS = ["http://localhost:3000"]

settings = Settings()
