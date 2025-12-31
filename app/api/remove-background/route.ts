export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBackground";
import { v2 as cloudinary } from "cloudinary";

// ---- Cloudinary config ----
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert file → buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary (temp public asset)
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "remove-background-temp",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    if (!uploadResult?.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    // Call Replicate with PUBLIC URL
    const result = await removeBackground(uploadResult.secure_url);

    return NextResponse.json({
      processed: result.processed,
      clean: result.clean,
    });
  } catch (err: any) {
    console.error("remove-background error:", err);

    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
