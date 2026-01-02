// app/api/remove-background/route.ts

export const runtime = "nodejs"; // 🔑 REQUIRED for Replicate SDK

import { removeBackground } from "@/lib/removeBackground";
import { uploadImage } from "@/lib/uploadImage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    console.log("FormData keys received:", [...formData.keys()]);

    const file =
      (formData.get("file") as File | null) ||
      (formData.get("image") as File | null) ||
      (formData.get("upload") as File | null);

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Upload image → get public URL
    const imageUrl = await uploadImage(file);

    // Replicate background removal (Node runtime required)
    const result = await removeBackground(imageUrl);

    return Response.json(result);
  } catch (err: any) {
    console.error("[remove-background route] ERROR:", err);
    return Response.json(
      {
        error: err?.message || "Background removal failed",
      },
      { status: 500 }
    );
  }
}
