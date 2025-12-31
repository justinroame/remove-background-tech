export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    let imageInput: string | null = null;

    // Try FormData first (file upload)
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image") as File | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        imageInput = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
    }

    // Fallback: JSON body with image URL (test images)
    if (!imageInput) {
      const body = await req.json().catch(() => null);
      if (body?.image && typeof body.image === "string") {
        imageInput = body.image;
      }
    }

    if (!imageInput) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const result = await removeBackground(imageInput);

    return NextResponse.json({
      processed: result.processed,
      clean: result.clean,
    });
  } catch (err) {
    console.error("remove-background failed:", err);
    return NextResponse.json(
      { error: "Background removal failed" },
      { status: 500 }
    );
  }
}
