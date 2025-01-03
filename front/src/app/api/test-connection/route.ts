// src/app/api/test-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // localhost ではなく analyze サービス名を使用
    const response = await fetch('http://analyze:8001/', {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { error: `Connection test failed: ${error.message}` },
      { status: 500 }
    );
  }
}