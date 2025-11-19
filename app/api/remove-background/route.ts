import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload original
    const original = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "remove-bg/original", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });

    const originalUrl = original.secure_url;

    // AI remover
    const output = (await replicate.run(
      "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
      { input: { image: originalUrl } }
    )) as unknown as string;

    const resp = await fetch(output);
    const cleanBuf = Buffer.from(await resp.arrayBuffer());

    //
    // ALWAYS CREATE WATERMARKED VERSION — for BOTH logged in & logged out
    //
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
        (err, result) =>
          err ? reject(err) : resolve(result!.secure_url)
      );
      stream.end(cleanBuf);
    });

    //
    // Logged out users → only return watermarked version
    //
    if (!userId) {
      return NextResponse.json({
        original: originalUrl,
        processed: watermarkedUrl,
        clean: null,
        hasCredits: false,
      });
    }

    // Logged in → check credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    const hasCredits = (user?.totalCredits ?? 0) >= 1;

    //
    // ALWAYS RETURN processed = watermarked version
    //
    let cleanUrl: string | null = null;

    if (hasCredits) {
      // Pre-generate clean version so download is instant
      cleanUrl = await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "remove-bg/clean", format: "png" },
          (err, result) =>
            err ? reject(err) : resolve(result!.secure_url)
        );
        stream.end(cleanBuf);
      });
    }

    return NextResponse.json({
      original: originalUrl,
      processed: watermarkedUrl,
      clean: cleanUrl, // only included for logged-in users with credits
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
