import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    const backendResponse = await fetch('http://localhost:8001/analyze-slide', {
      method: 'POST',
      body: formData,
    });

    if (!backendResponse.ok) {
      throw new Error(`Error: ${backendResponse.status}`);
    }

    const result = await backendResponse.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
