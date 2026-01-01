// app/api/remove-background/route.ts

import { removeBackground } from "@/lib/removeBackground";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json(
        { error: "Missing imageUrl" },
        { status: 400 }
      );
    }

    const result = await removeBackground(imageUrl);
    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Background removal failed" },
      { status: 500 }
    );
  }
}
