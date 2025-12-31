export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { processImage } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    // Hard fail with an explicit message if env missing (this is VERY likely on Vercel prod)
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Server misconfigured: REPLICATE_API_TOKEN is missing (check Vercel Env Vars for Production).",
        },
        { status: 500 }
      );
    }

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
    // IMPORTANT: surface the real error (so we stop guessing)
    console.error("remove-background error:", err);

    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
