export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBackground";

/**
 * Convert File → temporary object URL Replicate can consume
 */
async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let imageUrl: string | null = null;

    // Multipart upload
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image") as File | null;

      if (file) {
        imageUrl = await fileToDataUrl(file);
      }
    }

    // JSON (sample images)
    if (!imageUrl && contentType.includes("application/json")) {
      const body = await req.json();
      if (typeof body?.image === "string") {
        imageUrl = body.image;
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const result = await removeBackground(imageUrl);

    return NextResponse.json({
      processed: result.processed,
      clean: result.clean,
    });
  } catch (err: any) {
    console.error("remove-background failed:", err);
    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
