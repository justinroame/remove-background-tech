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
        { error: "No image uploaded" },
        { status: 400 }
      );
    }

    // ✅ Convert File → base64 data URL
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const base64DataUrl = `data:${file.type};base64,${base64}`;

    // ✅ Call Replicate
    const result = await removeBackground(base64DataUrl);

    return Response.json({ clean: result.clean });
  } catch (err: any) {
    console.error("[remove-background]", err);
    return Response.json(
      { error: err?.message || "Background removal failed" },
      { status: 500 }
    );
  }
}
