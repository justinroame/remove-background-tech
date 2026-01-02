// app/api/remove-background/route.ts

import { removeBackground } from "@/lib/removeBackground";
import { uploadImage } from "@/lib/uploadImage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // 🔍 DEBUG: remove after confirming key
    console.log("FormData keys received:", [...formData.keys()]);

    // Accept common field names (safe + flexible)
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

    // Upload image to storage → get public URL
    const imageUrl = await uploadImage(file);

    // Remove background via Replicate
    const result = await removeBackground(imageUrl);

    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      {
        error:
          err?.message ||
          "Background removal failed",
      },
      { status: 500 }
    );
  }
}
