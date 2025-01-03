# api/routes.py

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
from services.voice_analyzer import VoiceAnalyzer
from services.slide_analyzer import SlideAnalyzer
from config.settings import settings
from typing import List, Optional

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
    ref: Optional[List[UploadFile]] = File(None)
):    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="PDFファイルをアップロードしてください。")

    pdf_data = await file.read()
    analyzer = SlideAnalyzer()    
    compare_result = {}

    if ref: # 比較用のスライドがあった場合
        compare_result = await analyzer.compare(pdf_data, ref)
        
    """Analyze a single slide from a PDF."""        
    
    gemini_response, font_analysis = analyzer.analyze_slide(pdf_data)
    return JSONResponse(
        status_code=200,
        content={
            "gemini_response": gemini_response,
            "font_analysis": font_analysis,
            "compare_result": compare_result
        }
    )

@router.get("/")
def read_root():
    """Root endpoint."""
    return {"message": "Hello, World!"}
