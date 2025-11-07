import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadPreset = 'remove-bg';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      return NextResponse.json({ error: 'Cloudinary config missing' }, { status: 500 });
    }

    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('upload_preset', uploadPreset);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadForm }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || uploadData.error) {
      return NextResponse.json(
        { error: uploadData.error?.message || 'Upload failed' },
        { status: 500 }
      );
    }

    // Resize if too large (remove.bg style: >50 MP)
    let imageUrl = uploadData.secure_url;
    const originalSize = req.body.originalSize;  // From client
    const width = uploadData.width;
    const height = uploadData.height;
    const megapixels = (width * height) / 1000000;

    if (megapixels > 50) {
      imageUrl = uploadData.secure_url.replace('/upload/', '/upload/w_8688,h_5792,c_fill/');  // Resize to ~50 MP
    }

    // Call Replicate
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json({ error: 'Replicate token missing' }, { status: 500 });
    }

    const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b9530386789a535',
        input: { image: imageUrl },
      }),
    });

    const prediction = await replicateRes.json();

    if (!replicateRes.ok) {
      return NextResponse.json(
        { error: prediction.detail || 'AI prediction failed' },
        { status: 500 }
      );
    }

    // Poll for result
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30; // 30s timeout

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
      const poll = await fetch(result.urls.get, {
        headers: { Authorization: `Token ${replicateToken}` },
      });
      result = await poll.json();
    }

    if (result.status === 'failed' || attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'AI processing timed out or failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: result.output });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
