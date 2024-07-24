# ベースイメージとしてPython 3.10を使用
FROM python:3.10

# タイムゾーンを設定
ENV TZ Asia/Tokyo

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# 必要なシステム依存関係をインストール
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0

# PyTorchと必要なパッケージをインストール
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# requirements.txtをコンテナにコピー
COPY yolo/requirements.txt ./

# 必要なPythonパッケージをインストール
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pipx ensurepath && \
    pipx install ghunt

# アプリケーションコードをコピー
COPY . .

# コンテナ起動時にFastAPIサーバーを起動
CMD ["bash", "-c", "uvicorn main:app --reload --host 0.0.0.0 --port 8000"]
