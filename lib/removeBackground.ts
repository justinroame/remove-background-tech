// lib/removeBackground.ts
import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Remove background using Replicate rembg model.
 * Expects a PUBLIC HTTPS image URL.
 */
export async function removeBackground(imageUrl: string) {
  console.log("[removeBackground] Using image:", imageUrl);

  try {
    // ✅ DO NOT PIN A VERSION
    // Let Replicate select the latest permitted version
    const model = "cjwbw/rembg";

    const output = await replicate.run(model, {
      input: {
        image: imageUrl,
      },
    });

    console.log("[removeBackground] Replicate output:", output);

    const url =
      typeof output === "string"
        ? output
        : Array.isArray(output)
        ? output[0]
        : null;

    if (!url) {
      throw new Error("Replicate returned no output");
    }

    return {
      processed: url,
      clean: url,
    };
  } catch (err: any) {
    console.error("[removeBackground] Replicate error:", err);
    throw err;
  }
}
