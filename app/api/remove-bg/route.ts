// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image URL' }, { status: 400 });

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'Missing Replicate token' }, { status: 500 });

    console.log('Calling Replicate with image:', image);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "95fcc2a26a8d00949dc7607f7e5a0b2eb1b84d0a5d22d222d38f6e23f18f1061", // lucataco/remove-bg — PUBLIC & WORKING
        input: { image },
      }),
    });

    const data = await response.json();
    console.log('Replicate response:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Replicate API error' },
        { status: response.status }
      );
    }

    // Poll for result
    let result = data;
    let attempts = 0;
    const maxAttempts = 30;

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
      const poll = await fetch(result.urls.get, {
        headers: { Authorization: `Token ${token}` },
      });
      result = await poll.json();
      console.log('Poll result:', result);
    }

    if (result.status === 'failed' || attempts >= maxAttempts) {
      return NextResponse.json({ error: 'AI processing failed or timed out' }, { status: 500 });
    }

    return NextResponse.json({ result: result.output });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
