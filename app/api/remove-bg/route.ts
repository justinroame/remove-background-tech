// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image URL' }, { status: 400 });
    }

    // HARD-CODED TEST — SKIP REPLICATE
    console.log('BYPASSING REPLICATE — TEST MODE');
    console.log('Received image URL:', image);

    // Return a fake transparent PNG (from Replicate's example)
    return NextResponse.json({
      result: 'https://replicate.com/api/models/cjwbw/rembg/files/7c9d0cf0-3f2f-456e-5b2d-6e2d6e2d6e2d/output.png'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
