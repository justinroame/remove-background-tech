export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/uploadImage";
import { removeBackground } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    console.log("[remove-background] request received");

    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      console.error("[remove-background] no file");
      return NextResponse.json({ error: "No image" }, { status: 400 });
    }

    console.log("[remove-background] uploading to Cloudinary…");
    const imageUrl = await uploadImage(file);

    console.log("[remove-background] Cloudinary URL:", imageUrl);

    console.log("[remove-background] calling Replicate…");
    const result = await removeBackground(imageUrl);

    console.log("[remove-background] Replicate success:", result);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[remove-background] FATAL:", err);

    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err?.message ?? "unknown",
      },
      { status: 500 }
    );
  }
}
