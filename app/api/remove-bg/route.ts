// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 });

    const token = process.env.HUGGING_FACE_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'No HF token' }, { status: 500 });

    console.log('Sending to HF U2-Net:', image);

    const res = await fetch('https://router.huggingface.co/hf-inference/models/mattmdjaga/segformer_b2_clothes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: image }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.log('HF Error Response:', text);
      return NextResponse.json({ error: 'HF API error' }, { status: 500 });
    }

    const blob = await res.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const result = `data:image/png;base64,${buffer.toString('base64')}`;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
