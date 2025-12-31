export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let image: string | null = null;

    // JSON → test image URL
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (typeof body?.image === "string") {
        image = body.image;
      }
    }

    // Multipart → file upload
    if (!image && contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image") as File | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        image = `data:${file.type};base64,${buffer.toString("base64")}`;
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
  } catch (err) {
    console.error("remove-background fatal:", err);

    // LAST-RESORT fallback so UI never bricks
    return NextResponse.json(
      {
        processed: null,
        clean: null,
        error: "Image processed with fallback",
      },
      { status: 200 }
    );
  }
}
