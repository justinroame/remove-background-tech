import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { consumeCredits, getUserCreditSummary } from "@/lib/credits";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const dynamic = "force-dynamic";

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

    // Upload original to Cloudinary
    const original = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "remove-bg/original", resource_type: "image" },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(buffer);
    });

    const originalUrl = original.secure_url;

    //
    // RUN REPLICATE AI
    //
    const result = await replicate.run(
      "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
      { input: { image: originalUrl } }
    );

    const outputUrl =
      typeof result === "string"
        ? result
        : Array.isArray(result)
        ? result[0]
        : (result as any)?.output ||
          (result as any)?.url ||
          Object.values(result as any)[0];

    if (!outputUrl || typeof outputUrl !== "string") {
      throw new Error("Replicate returned invalid output URL");
    }

    const resp = await fetch(outputUrl);
    const cleanBuf = Buffer.from(await resp.arrayBuffer());

    //
    // ALWAYS PROCESS WATERMARK
    //
    const watermarkedUrl = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
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
      ).end(cleanBuf);
    });

    // NOT LOGGED IN → return ONLY WATERMARKED
    if (!userId) {
      return NextResponse.json({
        original: originalUrl,
        processed: watermarkedUrl,
        clean: null,
        hasCredits: false,
      });
    }

    //
    // LOGGED-IN PATH: CHECK + DEDUCT CREDIT BEFORE GENERATING CLEAN VERSION
    //

    const summary = await getUserCreditSummary(userId);
    const totalCredits = summary.total;

    if (totalCredits < 1) {
      return NextResponse.json({
        original: originalUrl,
        processed: watermarkedUrl,
        clean: null,
        hasCredits: false,
      });
    }

    // DEDUCT CREDIT (FIFO)
    await consumeCredits(userId, 1);

    // Generate clean version AFTER successful deduction
    const cleanUrl = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "remove-bg/clean", format: "png" },
        (err, result) => (err ? reject(err) : resolve(result!.secure_url))
      ).end(cleanBuf);
    });

    return NextResponse.json({
      original: originalUrl,
      processed: watermarkedUrl,
      clean: cleanUrl,
      hasCredits: true,
    });
  } catch (err: any) {
    console.error("REMOVE_BG_ERROR:", err);

    return NextResponse.json(
      { error: "Failed to process image", details: err.message },
      { status: 500 }
    );
  }
};
