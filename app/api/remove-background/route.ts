export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await removeBackground(image);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[remove-background] ERROR:", err);

    return NextResponse.json(
      { error: "Background removal failed" },
      { status: 500 }
    );
  }
}
