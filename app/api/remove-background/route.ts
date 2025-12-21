import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import { processImage } from "@/lib/removeBackground"; // keep your existing logic

export async function POST(req: Request) {
  const user = await getUserFromRequest();

  // Guests ARE allowed here — your UI logic already limits them
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No image provided" },
      { status: 400 }
    );
  }

  try {
    const result = await processImage(file, {
      watermark: !user, // guests get watermark
    });

    return NextResponse.json({
      processed: result.watermarked,
      clean: result.clean,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Image processing failed" },
      { status: 500 }
    );
  }
}
