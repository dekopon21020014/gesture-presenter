# services/voice_analyzer.py

import os
import librosa
import numpy as np
import ffmpeg
from fastapi import HTTPException
from reazonspeech.nemo.asr import transcribe, audio_from_path
from api.dependencies import gemini_model, speech_model, whisper_model
from config.settings import settings
from fastapi import File
import tempfile
import shutil

class VoiceAnalyzer:
    @staticmethod
    async def analyze(file_path: str) -> dict:
        wav_location = f"{settings.TEMP_DIR}/{os.path.splitext(os.path.basename(file_path))[0]}.wav"
        
        try:
            # Convert WebM to WAV
            ffmpeg.input(file_path).output(wav_location).run()
            
            # Transcribe audio
            audio = audio_from_path(wav_location)
            transcription = transcribe(speech_model, audio).subwords
            
            # Perform frequency analysis
            frequency_data = VoiceAnalyzer._analyze_frequency(wav_location)
            
            # Generate feedback
            feedback = VoiceAnalyzer._generate_feedback(transcription, frequency_data)
            
            return feedback
        
        finally:
            for temp_file in [file_path, wav_location]:
                if os.path.exists(temp_file):
                    os.remove(temp_file)

    @staticmethod
    def _analyze_frequency(wav_path: str) -> list:
        y, sr = librosa.load(wav_path, sr=16000)
        hop_length = int(0.1 * sr)
        frame_length = hop_length * 2

        spectral_centroids = librosa.feature.spectral_centroid(
            y=y, sr=sr, hop_length=hop_length, n_fft=frame_length
        )
        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)
        timestamps = librosa.times_like(spectral_centroids, sr=sr, hop_length=hop_length)

        return [
            {
                "time": round(float(t), 1),
                "frequency": float(f),
                "amplitude": float(v),
                "volume": float(v)
            }
            for t, f, v in zip(timestamps, spectral_centroids.T, rms.T)
        ]

    @staticmethod
    def _generate_feedback(transcription: str, frequency_data: list) -> str:
        analysis_text = (
            f"あなたはプレゼン音声マスターです。情報を提供するので、その発表内容に対して、"
            f"アクセント・音声の振幅が適切であるか判断してください。また、その音声について"
            f"アドバイス・ほめる点がある場合は、秒数とその部分の完全な文章を提供してください\n"
            f"文字と発話時間の結果: {transcription}\n"
            f"0.1秒ごとの周波数・振幅・音量の平均: {frequency_data}"
        )
        response = gemini_model.generate_content(analysis_text)
        return response.text

    async def transcribe(self, voice: File(...)) -> str:
        # 音声ファイルを一時的に保存
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio_file:
            temp_audio_path = temp_audio_file.name
            await voice.seek(0)
            shutil.copyfileobj(voice.file, temp_audio_file)

        transcription = whisper_model.transcribe(
            temp_audio_path, 
            task="transcribe", 
            language="Japanese"
        )['text']

        os.remove(temp_audio_path)
        return transcription