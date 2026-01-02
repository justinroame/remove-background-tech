// app/api/remove-background/route.ts

export const runtime = "nodejs"; // REQUIRED for Replicate

import { removeBackground } from "@/lib/removeBackground";

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

    const result = await removeBackground(file);

    return Response.json({
      clean: result.clean,
    });
  } catch (err: any) {
    console.error("[remove-background]", err);
    return Response.json(
      { error: err?.message || "Background removal failed" },
      { status: 500 }
    );
  }
}
