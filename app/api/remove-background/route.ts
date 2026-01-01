// app/api/remove-background/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { removeBackground } from "@/lib/removeBackground";
import crypto from "crypto";

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

function watermarkCloudinaryUrl(secureUrl: string) {
  // Works for typical Cloudinary "image/upload/...." URLs
  // Adds a simple text watermark in bottom-right.
  // If this ever fails, you'll still see the original image (not a hard crash).
  try {
    const marker = "/image/upload/";
    if (!secureUrl.includes(marker)) return secureUrl;

    const wm =
      "l_text:Arial_56:remove-background,co_white,opacity_55,g_south_east,x_30,y_25";
    return secureUrl.replace(marker, `${marker}${wm}/`);
  } catch {
    return secureUrl;
  }
}

export async function POST(req: Request) {
  console.log("[remove-background] POST hit");

  try {
    // Validate required envs (fast fail, clear detail)
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
    const publicId = `remove-background/originals/${crypto.randomUUID()}`;

    // 1) Upload original to Cloudinary (unique ID so no accidental overwrites)
    console.log("[remove-background] uploading original to Cloudinary...");
    const originalUpload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "remove-background/originals",
            public_id: publicId,
            overwrite: false,
            resource_type: "image",
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });

    const originalUrl = originalUpload?.secure_url as string | undefined;
    if (!originalUrl) throw new Error("Cloudinary upload failed (no secure_url)");

    console.log("[remove-background] Cloudinary original url:", originalUrl);

    // 2) Call Replicate using URL
    console.log("[remove-background] calling Replicate...");
    const { clean } = await removeBackground(originalUrl);
    console.log("[remove-background] Replicate clean url:", clean);

    // 3) Provide a watermarked preview (Cloudinary delivery transform)
    const watermarkedPreview = watermarkCloudinaryUrl(originalUrl);

    return NextResponse.json({
      processed: watermarkedPreview,
      clean,
      original: originalUrl,
    });
  } catch (err: any) {
    const detail = err?.message || "Unknown error";
    console.error("[remove-background] ERROR:", detail);

    return NextResponse.json(
      { error: "Background removal failed", detail },
      { status: 500 }
    );
  }
}
