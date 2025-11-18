// app/api/remove-background/route.ts ← FULL DROP-IN FIX
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
    // 1. Get session + user ID
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const form = await req.formData();
    const file = form.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 2. Upload original
    const original = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "remove-bg/original", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });

    const imageUrl = original.secure_url;

    // 3. Run background remover
    const output = (await replicate.run(
      "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
      { input: { image: imageUrl } }
    )) as unknown as string;

    // 4. Download clean result
    const resp = await fetch(output);
    const resultBuf = Buffer.from(await resp.arrayBuffer());

    // 5. CHECK CREDITS FROM DB (source of truth)
    const [user] = await db
      .select({ totalCredits: users.totalCredits })
      .from(users)
      .where(eq(users.id, userId));

    const hasCredits = user && (user.totalCredits ?? 0) >= 1;

    let processedUrl: string;

    if (hasCredits) {
      // Deduct 1 credit
      await db
        .update(users)
        .set({ totalCredits: user.totalCredits - 1 })
        .where(eq(users.id, userId));

      // Upload CLEAN version
      processedUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "remove-bg/clean", format: "png" },
          (err, result) => (err ? reject(err) : resolve(result!.secure_url))
        );
        stream.end(resultBuf);
      });
    } else {
      // Upload WATERMARKED version
      processedUrl = await new Promise((resolve, reject) => {
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
        stream.end(resultBuf);
      });
    }

    return NextResponse.json({
      original: imageUrl,
      processed: processedUrl, // watermarked if no credits
      clean: hasCredits ? processedUrl : null, // clean only if paid
      hasCredits,
    });
  } catch (error: any) {
    console.error("Remove background error:", error);
    return NextResponse.json(
      { error: "Failed to process image", details: error.message },
      { status: 500 }
    );
  }
};