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
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b9530386789a535',
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
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
      const poll = await fetch(result.urls.get, {
        headers: { Authorization: `Token ${replicateToken}` },
      });
      result = await poll.json();
      console.log('Poll result:', result);
    }

    if (result.status === 'failed') {
      return NextResponse.json({ error: result.error || 'AI failed' }, { status: 500 });
    }

    return NextResponse.json({ result: result.output });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
