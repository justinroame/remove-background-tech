// app/api/remove-background/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// ---- Cloudinary config ----
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
    // Validate required env vars
    requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    requireEnv("CLOUDINARY_API_KEY");
    requireEnv("CLOUDINARY_API_SECRET");

    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    console.log("[remove-background] file received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("[remove-background] uploading to Cloudinary with bg removal…");

    // 🔥 THIS IS THE IMPORTANT PART
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "remove-background/outputs",
            resource_type: "image",

            // ✅ Cloudinary AI background removal
            transformation: [
              {
                effect: "background_removal",
              },
            ],
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    if (!uploadResult?.secure_url) {
      throw new Error("Cloudinary background removal failed");
    }

    console.log(
      "[remove-background] Cloudinary bg-removed image:",
      uploadResult.secure_url
    );

    return NextResponse.json({
      processed: uploadResult.secure_url,
      clean: uploadResult.secure_url,
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
