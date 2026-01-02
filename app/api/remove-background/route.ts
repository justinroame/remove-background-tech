// app/api/remove-background/route.ts

import { removeBackground } from "@/lib/removeBackground";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file =
      (formData.get("image") as File | null) ||
      (formData.get("file") as File | null);

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 🔍 Call removeBackground, which now returns RAW DEBUG output
    const result = await removeBackground(file);

    // 🔍 TEMP: return raw output directly (do NOT expect `clean`)
    return Response.json(result);
  } catch (err: any) {
    console.error("[remove-background DEBUG ERROR]", err);
    return Response.json(
      { error: err?.message || "Background removal failed" },
      { status: 500 }
    );
  }
}
