from fastapi import HTTPException
from api.dependencies import gemini_model
from pydantic import BaseModel
import json

from prompts.load import load_prompt

class Presentation(BaseModel):
    slide: str
    transcription: str

class PresentationAnalyzer:
    async def compare(self, content: Presentation): 
        try:
            prompt = load_prompt(
                "analyze_presentation.txt",
                transcription=content.transcription,
                slide=content.slide
            )
            result = gemini_model.generate_content(prompt)
            response = json.loads(result.text.strip("```json\n").strip("```"))

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
        print(response)
        return response