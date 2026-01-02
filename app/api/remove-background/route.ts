import { removeBackground } from "@/lib/removeBackground";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File | null;

    if (!file) {
      return Response.json(
        { error: "No image file uploaded" },
        { status: 400 }
      );
    }

    const result = await removeBackground(file);

    return Response.json(result);
  } catch (err: any) {
    console.error("[remove-background]", err);
    return Response.json(
      { error: err?.message || "Background removal failed" },
      { status: 500 }
    );
  }
}
