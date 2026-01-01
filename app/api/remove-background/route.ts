// app/api/remove-background/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { removeBackground } from "@/lib/removeBackground";
import { getUserFromRequest } from "@/lib/auth";

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
    // Validate required env early (so logs show exactly what's missing)
    requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    requireEnv("CLOUDINARY_API_KEY");
    requireEnv("CLOUDINARY_API_SECRET");
    requireEnv("REPLICATE_API_TOKEN");

    const user = await getUserFromRequest(req).catch(() => null);
    console.log("[remove-background] user:", user ? "authed" : "guest");

    const contentType = req.headers.get("content-type") || "";
    console.log("[remove-background] content-type:", contentType);

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
    console.log("[remove-background] buffer bytes:", buffer.length);

    // 1) Upload ORIGINAL to Cloudinary (so Replicate always receives a clean URL)
    console.log("[remove-background] uploading original to Cloudinary...");

    const originalUpload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "remove-background/originals",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const originalUrl = originalUpload?.secure_url as string | undefined;
    if (!originalUrl) throw new Error("Cloudinary original upload failed (no secure_url)");
    console.log("[remove-background] original Cloudinary URL:", originalUrl);

    // 2) Call Replicate (should appear in dashboard if this succeeds)
    console.log("[remove-background] calling Replicate...");
    const rep = await removeBackground(originalUrl);
    console.log("[remove-background] Replicate returned:", rep);

    // 3) Upload Replicate output to Cloudinary (stable hosting + CORS-friendly)
    console.log("[remove-background] uploading Replicate output to Cloudinary...");
    const cleanUpload = await cloudinary.uploader.upload(rep.clean, {
      folder: "remove-background/outputs",
      resource_type: "image",
    });

    const cleanUrl = cleanUpload?.secure_url as string | undefined;
    const publicId = cleanUpload?.public_id as string | undefined;

    if (!cleanUrl || !publicId) {
      throw new Error("Cloudinary output upload failed");
    }

    console.log("[remove-background] clean Cloudinary URL:", cleanUrl);

    // 4) Watermark only for guests (preview image)
    let processedUrl = cleanUrl;

    if (!user) {
      processedUrl = cloudinary.url(publicId, {
        secure: true,
        transformation: [
          // make sure output stays png
          { fetch_format: "png" },
          // watermark text (simple + reliable)
          {
            overlay: {
              font_family: "Arial",
              font_size: 64,
              text: "remove-background.tech",
            },
            gravity: "south_east",
            x: 40,
            y: 40,
            opacity: 55,
            color: "white",
          },
        ],
      });

      console.log("[remove-background] watermarked URL:", processedUrl);
    }

    return NextResponse.json({
      processed: processedUrl, // preview (watermarked for guests)
      clean: cleanUrl, // clean download target
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
