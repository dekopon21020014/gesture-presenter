import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const presentations = await req.json();

    if (!presentations || typeof presentations !== 'object') {
      return NextResponse.json({ error: 'Invalid presentations data' }, { status: 400 });
    }

    const response = await fetch('http://analyze:8001/analyze-presentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(presentations),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: `Error processing request: ${error.message}` },
      { status: 500 }
    );
  }
}
