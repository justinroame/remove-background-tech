export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let image: string | null = null;

    // Multipart upload
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image") as File | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        image = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
    }

    // JSON (sample images)
    if (!image && contentType.includes("application/json")) {
      const body = await req.json();
      if (typeof body?.image === "string") {
        image = body.image;
      }
    }

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const result = await removeBackground(image);

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
