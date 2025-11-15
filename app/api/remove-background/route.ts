// app/api/remove-background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const POST = async (req: NextRequest) => {
  try {
    const form = await req.formData();
    const file = form.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1) Upload original to Cloudinary
    const original = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'remove-bg/original', resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });

    const imageUrl = original.secure_url;

    // 2) Run background remover on Replicate
    const output = (await replicate.run(
      '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
      { input: { image: imageUrl } }
    )) as unknown as string;

    // 3) Download result from Replicate and upload WATERMARKED version to Cloudinary
    const resp = await fetch(output);
    const resultBuf = Buffer.from(await resp.arrayBuffer());

    const processed = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'remove-bg/processed',
          format: 'png',
          resource_type: 'image',
          transformation: [
            { width: 1024, crop: 'limit' },
            {
              overlay: {
                font_family: 'Arial',
                font_size: 40,
                text: 'remove-background.tech',
                opacity: 50,
              },
              gravity: 'center',
            },
          ],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(resultBuf);
    });

    // processed.secure_url = watermarked
    // output = clean transparent PNG from Replicate

    return NextResponse.json({
      original: imageUrl,
      processed: processed.secure_url, // watermarked
      clean: output,                    // no watermark
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error.message },
      { status: 500 }
    );
  }
};
