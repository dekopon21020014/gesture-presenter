# ベースイメージを指定
FROM node:18.17.1

# 作業ディレクトリを設定
WORKDIR /app

# キャッシュ利用で効率化するために別でコピー
COPY /front/package.json /front/package-lock.json ./

# ソースコードをコピー
COPY /front ./

# 依存関係をインストール
RUN npm install 
#&& npm install @emotion/react @emotion/styled && npm install @mui/material && npm install react-hook-form

# アプリケーションをビルド
#RUN npm run build
