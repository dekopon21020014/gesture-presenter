# api/routes.py

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
from services.voice_analyzer import VoiceAnalyzer
from services.slide_analyzer import SlideAnalyzer
from services.presentation_analyzer import PresentationAnalyzer, Presentation
from utils.pdf_utils import get_text
from config.settings import settings
from typing import List, Optional, Dict

router = APIRouter()

@router.post("/analyze-voice")
async def analyze_voice(file: UploadFile = File(...)):
    """Analyze uploaded voice file."""
    file_location = f"{settings.TEMP_DIR}/{file.filename}"
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    result = await VoiceAnalyzer.analyze(file_location)
    return JSONResponse(
        status_code=200, 
        content={"gemini_response": result}
    )

@router.post("/analyze-slide")
async def analyze_slide(
    file: UploadFile = File(...), 
    ref: Optional[List[UploadFile]] = File(None),
    remove_texts: List[str] = Form([])
):    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="PDFファイルをアップロードしてください。")

    pdf_data = await file.read()
    analyzer = SlideAnalyzer()
    comparison_result = {}
    comparison_feedback = ""

    if ref: # 比較用のスライドがあった場合
        comparison_result = await analyzer.compare(pdf_data, ref, remove_texts)
        comparison_feedback = analyzer.get_comparison_feedback(comparison_result)
        
    """Analyze a single slide from a PDF."""        
    
    gemini_response, font_analysis = analyzer.analyze_slide(pdf_data, remove_texts)
    return JSONResponse(
        status_code=200,
        content={
            "gemini_response": gemini_response,
            "font_analysis": font_analysis,
            "compare_result": comparison_result,
            "comparison_feedback": comparison_feedback
        }
    )

@router.post("/transcribe")
async def analyze_presentation(voice: UploadFile = File(...)):
    analyzer = VoiceAnalyzer()
    transcription = await analyzer.transcribe(voice)    
    return {"transcription": transcription}

@router.post("/get-text")
async def analyze_presentation(file: UploadFile = File(...)):    
    pdf_data = await file.read()
    return get_text(pdf_data)

@router.post("/analyze-presentation")
async def analyze_presentation(presentations: Dict[int, Presentation]):    
    analyzer = PresentationAnalyzer()
    result = {}
    # デバッグ用に受け取ったデータを表示
    for page, content in presentations.items():
        result[page] = await analyzer.compare(content)

    return {
        "message": "Slides processed successfully", 
        "pages_received": len(presentations), 
        "result": result
    }
    
@router.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "Hello, World!"}
