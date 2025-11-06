// app/api/remove-bg/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary (unsigned)
    const uploadPreset = 'remove-bg';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary config missing' },
        { status: 500 }
      );
    }

    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('upload_preset', uploadPreset);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadForm,
      }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || uploadData.error) {
      return NextResponse.json(
        { error: uploadData.error?.message || 'Upload failed' },
        { status: 500 }
      );
    }

    const publicId = uploadData.public_id;

    // Call Replicate
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json(
        { error: 'Replicate token missing' },
        { status: 500 }
      );
    }

    const replicateRes = await fetch(
      'https://api.replicate.com/v1/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version:
            'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b9530386789a535',
          input: {
            image: uploadData.secure_url,
          },
        }),
      }
    );

    const prediction = await replicateRes.json();

    if (!replicateRes.ok) {
      return NextResponse.json(
        { error: prediction.detail || 'AI failed' },
        { status: 500 }
      );
    }

    // Poll until done
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise((r) => setTimeout(r, 1000));
 Wales
      const poll = await fetch(result.urls.get, {
        headers: { Authorization: `Token ${replicateToken}` },
      });
      result = await poll.json();
    }

    if (result.status === 'failed') {
      return NextResponse.json(
        { error: 'AI processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: result.output });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
