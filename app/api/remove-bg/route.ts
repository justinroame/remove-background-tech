// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 });

    const body = JSON.stringify({
      version: "851-labs/background-remover",
      input: { image }
    });

    console.log('Sending to Replicate:', body);

    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body
    });

    const data = await res.json();
    console.log('Replicate response:', data);

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'API error' }, { status: res.status });
    }

    let result = data;
    for (let i = 0; i < 30; i++) {
      if (result.status === 'succeeded' || result.status === 'failed') break;
      await new Promise(r => setTimeout(r, 1000));
      const poll = await fetch(result.urls.get, { headers: { Authorization: `Token ${token}` } });
      result = await poll.json();
    }

    if (result.status !== 'succeeded') {
      return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
    }

    return NextResponse.json({ result: result.output });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
