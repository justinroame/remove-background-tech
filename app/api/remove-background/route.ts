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

    // Convert file → raw base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const result = await removeBackground(base64);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("remove-background error:", err);
    return NextResponse.json(
      { error: "Background removal failed", detail: err?.message },
      { status: 500 }
    );
  }
}
