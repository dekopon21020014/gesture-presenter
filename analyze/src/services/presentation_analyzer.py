from fastapi import HTTPException
from api.dependencies import gemini_model
from utils.pdf_utils import extract_text_and_font_size, analyze_font_metrics
from collections import defaultdict
import numpy as np
from pydantic import BaseModel
from prompts.load import load_prompt

# JSON形式のデータを定義
class Presentation(BaseModel):
    slide: str
    transcription: str

class PresentationAnalyzer:
    """Analyze slide content."""
    def __init__(self):
        self.content_categories = {
            "technical": "技術的な説明や実装の詳細",
            "background": "背景説明や課題提起",
            "methodology": "手法や解決アプローチの説明",
            "results": "結果や成果の説明",
            "conclusion": "まとめや今後の展望"
        }

    async def compare(self, content: Presentation): 
        try:
            # Gemini APIを呼び出して評価を取得
            prompt = f"""
            あなたは専門的なスライド発表アドバイザーです
            以下のスライド内容と発言内容について、以下の観点で評価してください：
            1. スライドの内容がどの程度発言内容と一致しているかをスコア（0-100）で評価。
            2. スライドを単に読み上げているか（例: 発言がスライド内容をそのまま引用している）を判断。
            3. 読み上げに該当する場合、「改善案」を提供。
            
            - スライド内容: "{content.slide}"
            - 発言内容: "{content.transcription}"
            """
            response = gemini_model.generate_content(prompt)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing page {page}: {str(e)}")

        return response.text