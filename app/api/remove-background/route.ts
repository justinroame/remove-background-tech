// app/api/remove-background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
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

    // Step 1: Upload original image to Cloudinary
    const original = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'remove-bg/original',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = original.secure_url;

    // Step 2: Run Replicate background removal model
    const output = (await replicate.run(
      '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
      { input: { image: imageUrl } }
    )) as string;

    // Step 3: Download result and upload to Cloudinary as PNG
    const resultResponse = await fetch(output);
    const resultBuffer = Buffer.from(await resultResponse.arrayBuffer());

    const processed = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'remove-bg/processed',
          format: 'png',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(resultBuffer);
    });

    return NextResponse.json({
      original: imageUrl,
      processed: processed.secure_url,
    });
  } catch (error: any) {
    console.error('Background removal failed:', error);
    return NextResponse.json(
      { error: 'Failed to remove background', details: error.message },
      { status: 500 }
    );
  }
};
