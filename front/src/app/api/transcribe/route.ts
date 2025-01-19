import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log("=======================");
    const formData = await req.formData();
    const file = formData.get('voice');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Invalid voice file' }, 
        { status: 400 }
      );
    }

    const apiFormData = new FormData();
    apiFormData.append('voice', file);
    const response = await fetch('http://analyze:8001/transcribe', {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
      body: apiFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error details:', error);
    if (error instanceof Error) {
        return NextResponse.json(
            { error: `Error processing file: ${error.message}` },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 }
    );
  }
}