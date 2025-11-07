// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const token = process.env.HUGGING_FACE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'No HF token' }, { status: 500 });

    console.log('Received image URL:', image);
    console.log('Token length:', token.length);

    const body = JSON.stringify({ inputs: image });
    console.log('Request body:', body);

    const res = await fetch('https://router.huggingface.co/hf-inference/models/keremberke/remove-bg', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.log('HF Raw Response:', text);
      return NextResponse.json({ error: 'HF error' }, { status: 500 });
    }

    const blob = await res.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const result = `data:image/png;base64,${buffer.toString('base64')}`;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
