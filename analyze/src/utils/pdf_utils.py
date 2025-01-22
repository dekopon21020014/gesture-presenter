# utils/pdf_utils.py

import random
import string
import re 
import fitz
from fastapi import HTTPException
from statistics import mean, stdev

def generate_random_string(min_length: int = 5, max_length: int = 10) -> str:
    """Generate a random string (5 to 10 characters)."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=random.randint(min_length, max_length)))

def extract_text_and_font_size(pdf_data: bytes, remove_texts: list[str]) -> list:
    """Extract text and font sizes from a PDF."""
    replace_pairs = {text: generate_random_string() for text in remove_texts}
    doc = fitz.open(stream=pdf_data, filetype="pdf")
    text_with_font = []

    try:
        for page in doc:
            blocks = page.get_text("dict")["blocks"]
            for block in blocks:
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        text = span.get("text", "").strip()
                        size = span.get("size")
                        if text and size:
                            # Replace secret information
                            for target, replacement in replace_pairs.items():
                                text = re.sub(re.escape(target), replacement, text, flags=re.IGNORECASE)
                            
                            text_with_font.append((text, size))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF解析エラー: {str(e)}")
    finally:
        doc.close()

    return text_with_font

def analyze_font_metrics(font_sizes: list) -> dict:
    """Calculate font metrics from a list of font sizes."""
    return {
        "mean_size": mean(font_sizes) if font_sizes else 0,
        "std_size": stdev(font_sizes) if len(font_sizes) > 1 else 0,
        "size_variation": len(set(round(size) for size in font_sizes))
    }

def get_text(pdf_data: bytes) -> dict:
    doc = fitz.open(stream=pdf_data, filetype="pdf")
    text = {}
    try:
        for i, page in enumerate(doc, start=1):
            text[i] = page.get_text()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF解析エラー: {str(e)}")
    
    return text
