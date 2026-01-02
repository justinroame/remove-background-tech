// app/api/remove-background/route.ts
import { removeBackground } from "@/lib/removeBackground";

export const runtime = "nodejs"; // REQUIRED for Replicate

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return Response.json(
        { error: "No image uploaded" },
        { status: 400 }
      );
    }

    // Convert file → base64 data URL
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await removeBackground(base64);

    return Response.json(result);
  } catch (err: any) {
    console.error("[remove-background]", err);
    return Response.json(
      { error: err?.message || "Background removal failed" },
      { status: 500 }
    );
  }
}
