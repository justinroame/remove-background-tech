// lib/removeBackground.ts

/**
 * Remove background using Replicate (851 Labs background remover).
 *
 * IMPORTANT:
 * - Server-only
 * - No static import of "replicate"
 * - Uses implicit latest model version (correct for Replicate)
 */

import "server-only";

const MODEL = "851-labs/background-remover";

export async function removeBackground(imageUrl: string) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  try {
    // Dynamic import prevents Next.js build failure
    const { default: Replicate } = await import("replicate");

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(MODEL, {
      input: {
        image: imageUrl,
      },
    });

    // 851 Labs returns an array of URLs
    const url =
      Array.isArray(output) && typeof output[0] === "string"
        ? output[0]
        : typeof output === "string"
        ? output
        : null;

    if (!url) {
      throw new Error("Replicate returned no output URL");
    }

    return { clean: url };
  } catch (err: any) {
    const message =
      err?.response?.data?.detail ||
      err?.response?.data?.title ||
      err?.message ||
      String(err);

    console.error("[removeBackground] ERROR:", message);
    throw new Error(message);
  }
}
