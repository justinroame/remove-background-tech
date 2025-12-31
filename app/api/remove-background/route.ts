export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image uploaded" },
        { status: 400 }
      );
    }

    // Convert File → raw base64 (NO data: prefix)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const result = await removeBackground(base64);

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
