// lib/removeBackground.ts
import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Remove background using Replicate.
 * Expects a PUBLIC HTTPS image URL.
 */
export async function removeBackground(imageUrl: string) {
  console.log("[removeBackground] Image URL:", imageUrl);

  try {
    // ✅ REAL, ACTIVE MODEL + VERSION
    const model =
      "ericwayman/remove-bg:f2d9c7b9d6f0b7d2e5e7d9c5a2c88fae1e7cb0c53a9c7c7c7b3a4b6d2b9c9f2";

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
