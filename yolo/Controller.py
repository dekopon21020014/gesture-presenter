import json
import os
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import ORJSONResponse
from PIL import Image
from ultralytics import YOLO
from io import BytesIO

# クラスIDをクラス名に変換する辞書（不要ですが、コードには残しています）
class_names = {
    0: "Anger怒り",
    1: "Contempt軽蔑",
    2: "Disgust嫌悪",
    3: "Fear恐怖",
    4: "Happy幸せ",
    5: "Neutral無表情",
    6: "Sad悲しみ",
    7: "Surprise驚き",
}

# YOLOv8モデルをロード
model = YOLO('hyoujou.pt')  # モデルファイルのパスを指定

router = APIRouter(tags=["Demo"], default_response_class=ORJSONResponse)

@router.post(
    path="/yolo",
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_200_OK: {"description": "200 ok"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Internal server error"},
    },
)
async def predict(file: UploadFile = File(...)):
    try:
        # 画像ファイルをバイトストリームとして読み込み
        image_bytes = await file.read()
        
        # バイトストリームから画像を開く
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        # YOLO モデルで物体認識を実行（conf=0.6を設定）
        results = model(image, conf=0.6)

        # クラスIDのみをリストに追加
        class_ids = []
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls)
                class_ids.append(class_id)
        
        return ORJSONResponse(
            status_code=status.HTTP_200_OK,
            content={"class_ids": class_ids}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
