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
 * Expects a PUBLIC HTTPS image URL (NOT base64).
 */
export async function removeBackground(imageUrl: string) {
  try {
    // Stable, known-good rembg version
    const model =
      "cjwbw/rembg:a93868b281a0e433b15c77b7c3539d5f0e2c2ed9be5a3727d2a6b1189d88b4f1";

    const output = await replicate.run(model, {
      input: {
        image: imageUrl,
      },
    });

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
    console.error("Replicate error:", err);
    throw new Error(err?.message || "Replicate processing failed");
  }
}
