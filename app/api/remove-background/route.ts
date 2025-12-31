// app/api/remove-background/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { processImage } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const result = await processImage(file, { watermark: true });

    return NextResponse.json({
      processed: result.watermarked,
      clean: result.clean,
    });
  } catch (err: any) {
    console.error("remove-background failed:", err);

    // IMPORTANT: return detail so your homepage shows WHY it failed
    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
