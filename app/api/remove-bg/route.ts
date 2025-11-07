// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image URL' }, { status: 400 });
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json({ error: 'Missing Replicate token' }, { status: 500 });
    }

    console.log('Calling Replicate with image:', image);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "c751e9b5f8074a7a747c2e7d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2", // lucataco/remove-bg — PUBLIC & WORKING
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
        headers: { Authorization: `Token ${replicateToken}` },
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
