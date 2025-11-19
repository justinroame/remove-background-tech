// app/api/remove-background/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    // Session is OPTIONAL now – guests are allowed
    const session = await getServerSession(authOptions);

    const form = await req.formData();
    const file = form.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Upload original to Cloudinary
    const originalUpload = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "remove-bg/original", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });

    const imageUrl = originalUpload.secure_url as string;

    // 2. Run Replicate to remove background
    const output = (await replicate.run(
      "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
      { input: { image: imageUrl } }
    )) as unknown as string;

    const resp = await fetch(output);
    const resultBuf = Buffer.from(await resp.arrayBuffer());

    // 3. Upload WATERMARKED version (for everyone)
    const watermarkedUpload = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "remove-bg/processed",
          format: "png",
          transformation: [
            { width: 1024, crop: "limit" },
            {
              overlay: {
                font_family: "Arial",
                font_size: 50,
                font_weight: "bold",
                text: "remove-background.tech",
                opacity: 70,
              },
              gravity: "center",
              y: 20,
            },
          ],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(resultBuf);
    });

    const processedUrl = watermarkedUpload.secure_url as string;

    // 4. Upload CLEAN version (used for paid downloads)
    const cleanUpload = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "remove-bg/clean",
          format: "png",
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(resultBuf);
    });

    const cleanUrl = cleanUpload.secure_url as string;

    return NextResponse.json({
      original: imageUrl,
      processed: processedUrl, // watermarked for preview + free download
      clean: cleanUrl, // UI will gate this behind login + credits
      // (optional) you can expose whether user is logged in
      isLoggedIn: !!session?.user,
    });
  } catch (error: any) {
    console.error("Remove background error:", error);
    return NextResponse.json(
      { error: "Failed to process image", details: error.message },
      { status: 500 }
    );
  }
};
