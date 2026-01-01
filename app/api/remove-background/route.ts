// app/api/remove-background/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { removeBackground } from "@/lib/removeBackground";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export async function POST(req: Request) {
  console.log("[remove-background] POST hit");

  try {
    // Validate envs early
    requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    requireEnv("CLOUDINARY_API_KEY");
    requireEnv("CLOUDINARY_API_SECRET");
    requireEnv("REPLICATE_API_TOKEN");

    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log("[remove-background] file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1) Upload original to Cloudinary
    console.log("[remove-background] uploading original to Cloudinary...");
    const originalUpload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "remove-background/originals" },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });

    if (!originalUpload?.secure_url) {
      throw new Error("Cloudinary upload failed");
    }

    console.log(
      "[remove-background] Cloudinary original:",
      originalUpload.secure_url
    );

    // 2) Call Replicate
    console.log("[remove-background] calling Replicate...");
    const rep = await removeBackground(originalUpload.secure_url);

    // 3) Upload result to Cloudinary
    console.log("[remove-background] uploading Replicate output...");
    const cleanUpload = await cloudinary.uploader.upload(rep.clean, {
      folder: "remove-background/outputs",
      resource_type: "image",
    });

    if (!cleanUpload?.secure_url) {
      throw new Error("Cloudinary output upload failed");
    }

    return NextResponse.json({
      processed: cleanUpload.secure_url,
      clean: cleanUpload.secure_url,
    });
  } catch (err: any) {
    console.error("[remove-background] ERROR:", err);
    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
