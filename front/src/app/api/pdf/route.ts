import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 'uploads' ディレクトリが存在することを確認してください
    const uploadDir = join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create upload directory:', err);
    }
    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    console.log(`File saved to ${filePath}`);

    // ここでデータベースへの保存などの追加処理を行うことができます

    return NextResponse.json({ message: 'File uploaded successfully', fileName: file.name });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}