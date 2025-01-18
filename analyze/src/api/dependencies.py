 # api/dependencies.py

import google.generativeai as genai
from reazonspeech.nemo.asr import load_model
import whisper
from config.settings import settings
import os

def init_gemini():
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel("gemini-1.5-flash")

def init_speech_model():
    import torch

    # GPU が利用可能であれば利用する
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # 環境変数の設定 (特定の GPU を指定する場合)
    if device == "cuda":
        os.environ["CUDA_VISIBLE_DEVICES"] = settings.CUDA_VISIBLE_DEVICES
    else:
        os.environ["CUDA_VISIBLE_DEVICES"] = ""

    # TEMP_DIR を作成
    os.makedirs(settings.TEMP_DIR, exist_ok=True)

    speech_model = load_model(device=device)
    whisper_model = whisper.load_model("large").to(device)

    # モデルをロード
    return speech_model, whisper_model

gemini_model = init_gemini()
speech_model, whisper_model = init_speech_model()