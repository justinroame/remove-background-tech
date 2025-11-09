// app/api/remove-background/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';

// Env setup (Vercel handles these)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });

    // Step 1: Upload original to Cloudinary
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const originalUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'originals' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(originalBuffer);
    }) as any;
    const inputUrl = originalUpload.secure_url;

    // Step 2: Call Replicate
    const output = await replicate.run(
      '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc', // Latest version
      { input: { image: inputUrl } }
    ) as string; // Returns processed image URL

    // Step 3: Upload result to Cloudinary
    const response = await fetch(output);
    const resultBuffer = Buffer.from(await response.arrayBuffer());
    const resultUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'processed', format: 'png' }, // Force PNG for transparency
        (error, result) => (error ? reject(error) : resolve(result))
      );
      uploadStream.end(resultBuffer);
    }) as any;
    const processedUrl = resultUpload.secure_url;

    // Optional: Cleanup original if not needed
    // await cloudinary.uploader.destroy(originalUpload.public_id);

    return NextResponse.json({ processedUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
