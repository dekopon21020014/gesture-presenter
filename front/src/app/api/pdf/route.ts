import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import fs from 'fs';
import path, { join } from 'path';

async function getFileList() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try {
    const files = await fs.promises.readdir(uploadsDir);
    return files.filter(file => file.endsWith('.pdf'));  // PDFファイルのみをフィルタリング
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

// PDFファイルの取得
// 1. 特定のPDFファイルの取得: /api/pdf?filename=example.pdf
// 2. PDFファイル一覧の取得: /api/pdf?list=true
export async function GET(request: NextRequest) {
  const fileid = request.nextUrl.searchParams.get('fileid');
  const listFiles = request.nextUrl.searchParams.get('list');

  if (listFiles === 'true') {
    const fileList = await getFileList();
    return NextResponse.json({ files: fileList });
  }
  
  if (!fileid) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    console.log(fileid);
    const response = await fetch(`http://localhost:8080/api/pdf/${fileid}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const blob = await response.blob();
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileid}"`,
      },
    });
  } catch (error) {
    console.error('Error reading file:', error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    } else {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

}

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