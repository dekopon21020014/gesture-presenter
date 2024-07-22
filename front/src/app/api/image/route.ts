import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }
    
    // Base64データから実際のバイナリデータを抽出
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // 'uploads' ディレクトリが存在することを確認
    const uploadDir = join(process.cwd(), 'uploads/images');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create upload directory:', err);
    }

    // ファイル名を生成（タイムスタンプを使用）
    const fileName = `image_${Date.now()}.jpg`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    console.log(`File saved to ${filePath}`);

    // ここでデータベースへの保存などの追加処理を行うことができます

    return NextResponse.json({ message: 'File uploaded successfully', fileName: fileName });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}