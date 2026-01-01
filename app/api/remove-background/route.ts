import { removeBackground } from "@/lib/removeBackground";
import { uploadImage } from "@/lib/uploadImage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Upload file to storage and get a public URL
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
