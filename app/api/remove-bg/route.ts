// app/api/remove-bg/route.ts
// FORCE FRESH BUILD — 2025-11-08 10:00import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 });

    // PING TEST — ADD THIS TO SEE IF REPLICATE IS REACHABLE
    const testPing = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'GET',
      headers: { 'Authorization': `Token ${token}` },
    });
    console.log('Ping status:', testPing.status); // ← This will show 401 (OK) or error

    const body = JSON.stringify({
      version: "cjwbw/rembg:7c9d0cf03f2f456e5b2d6e2d6e2d6e2d6e2d6e2d6e2d6e2d6e2d6e2d6e2d6e2d",
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
