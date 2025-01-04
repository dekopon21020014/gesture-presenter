# ベースイメージとして公式の Python イメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# 必要な依存関係をシステムにインストール
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    libsndfile1 \
    libsndfile1-dev \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python のパッケージキャッシュを利用できるように設定し、依存関係をインストール
COPY ./src/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip uninstall -y pymupdf && \
    pip install pymupdf

# ReazonSpeech を GitHub からクローン
RUN git clone https://github.com/reazon-research/ReazonSpeech
# nemo-asr をインストール
RUN pip install ./ReazonSpeech/pkg/nemo-asr

# FastAPI アプリケーションを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
