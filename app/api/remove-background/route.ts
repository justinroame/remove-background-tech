// /app/api/remove-background/route.ts
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import sharp from "sharp";

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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    // Convert ANY format → clean JPEG buffer (handles HEIC, WebP, AVIF, TIFF, etc.)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const jpegBuffer = await sharp(buffer)
      .rotate() // Fix orientation from EXIF
      .jpeg({ quality: 95 })
      .toBuffer();

    // Upload original (for storage)
    const original = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "remove-bg/original", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(jpegBuffer);
    });

    // Run Replicate
    const result = await replicate.run(
      "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
      {
        input: {
          image: `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`,
        },
      }
    );

    let outputUrl: string | null = null;
    if (typeof result === "string") outputUrl = result;
    else if (Array.isArray(result)) outputUrl = result[0];
    else outputUrl = (result as any)?.output || Object.values(result as any)[0];

    if (!outputUrl || typeof outputUrl !== "string") {
      throw new Error("Replicate returned invalid output");
    }

    const resp = await fetch(outputUrl);
    const cleanBuf = Buffer.from(await resp.arrayBuffer());

    // Watermarked version
    const watermarkedUrl = await new Promise<string>((resolve, reject) => {
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
        (err, result) => (err ? reject(err) : resolve(result!.secure_url))
      );
      stream.end(cleanBuf);
    });

    // Clean version
    const cleanUrl = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "remove-bg/clean", format: "png" },
        (err, result) => (err ? reject(err) : resolve(result!.secure_url))
      );
      stream.end(cleanBuf);
    });

    // Credit check
    let hasCredits = false;
    if (userId) {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      hasCredits = (user?.totalCredits ?? 0) >= 1;
    }

    return NextResponse.json({
      original: original.secure_url,
      processed: watermarkedUrl,
      clean: cleanUrl,
      hasCredits,
    });
  } catch (err: any) {
    console.error("REMOVE_BG_ERROR:", err);
    return NextResponse.json(
      { error: "Failed to process image", details: err.message },
      { status: 500 }
    );
  }
};

export const config = {
  api: { bodyParser: false },
};