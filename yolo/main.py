import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import Controller

app = FastAPI()

# CORSミドルウェアの追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # 必要に応じて許可するメソッドを指定
    allow_headers=["*"],  # 必要に応じて許可するヘッダーを指定
)


app.include_router(Controller.router)


if __name__ == '__main__':
    host = '127.0.0.1'
    port = 8000
    # main: ファイル名、app: インスタンス名
    uvicorn.run('main:app', host=host, port=port, reload=True)