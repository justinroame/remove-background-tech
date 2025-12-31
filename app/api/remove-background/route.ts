export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBackground";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  console.log("[remove-background] POST hit");

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    console.log("[remove-background] File received:", file.type, file.size);

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("[remove-background] Uploading to Cloudinary");

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    console.log(
      "[remove-background] Cloudinary URL:",
      uploadResult.secure_url
    );

    const result = await removeBackground(uploadResult.secure_url);

    console.log("[remove-background] Replicate success");

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[remove-background] ERROR:", err);

    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
