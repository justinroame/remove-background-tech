// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 });

    console.log('Calling Replicate with image:', image);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "lucataco/remove-bg", // OFFICIAL NAME — WORKS WITH CREDITS
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

    let result = data;
    let attempts = 0;
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
      const poll = await fetch(result.urls.get, {
        headers: { Authorization: `Token ${token}` },
      });
      result = await poll.json();
    }

    if (result.status !== 'succeeded') {
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }

    return NextResponse.json({ result: result.output });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
