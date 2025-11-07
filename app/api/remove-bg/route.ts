// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 });

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b9530386789a535",
        input: { image }
      }),
    });

    const prediction = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: prediction.detail || 'API error' }, { status: response.status });
    }

    // ADD THIS CHECK
    if (!prediction.urls || !prediction.urls.get) {
      return NextResponse.json({ error: 'No poll URL returned' }, { status: 500 });
    }

    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(result.urls.get, {
        headers: { Authorization: `Token ${token}` }
      });
      result = await poll.json();
    }

    if (result.status !== 'succeeded') {
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }

    return NextResponse.json({ output: result.output });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
