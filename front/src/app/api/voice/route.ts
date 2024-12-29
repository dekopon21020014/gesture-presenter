import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // ファイル操作を行うためにNode.js環境で実行

export async function POST(request: Request) {
    console.log("this is API function");
    try {
    // 保存先ディレクトリのパス
    const saveDir = path.join(process.cwd(), 'src/app/voice');

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // ファイルデータを取得
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // BlobをBufferに変換
    const buffer = Buffer.from(await file.arrayBuffer());

    // ファイル名（タイムスタンプを使う例）
    const fileName = `audio-${Date.now()}.mp3`;
    const filePath = path.join(saveDir, fileName);

    // ファイルを保存
    fs.writeFileSync(filePath, new Uint8Array(buffer));

    return NextResponse.json({ message: 'File uploaded successfully', filePath });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
