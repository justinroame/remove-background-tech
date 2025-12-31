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
  try {
    // ✅ CONFIRMED working public rembg model
    const MODEL =
      "cjwbw/rembg:fb8af171cfa5504d5ceafdba8c0fe0c84b4c8b2ce1a42a7b1c304af22aa32b3a";

    const output = await replicate.run(MODEL, {
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
    console.error("[removeBackground] Replicate error:", err);
    throw new Error(err?.message || "Replicate processing failed");
  }
}
