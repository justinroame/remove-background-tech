export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/uploadImage";
import { removeBackground } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // 1️⃣ Upload to Cloudinary
    const imageUrl = await uploadImage(file);

    // 2️⃣ Send URL to Replicate
    const result = await removeBackground(imageUrl);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("remove-background error:", err);

    return NextResponse.json(
      {
        error: "Background removal failed",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
