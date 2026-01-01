// lib/removeBackground.ts

/**
 * Remove background using Replicate rembg model.
 * IMPORTANT:
 * - Replicate must be dynamically imported to avoid Next.js build failure
 * - Do NOT import "replicate" at the top of the file
 */

const MODEL =
  "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";

export async function removeBackground(imageUrl: string) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  console.log("[removeBackground] input:", imageUrl);

  try {
    // 🔑 Dynamic import — THIS fixes your build error
    const { default: Replicate } = await import("replicate");

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(MODEL, {
      input: { image: imageUrl },
    });

    console.log("[removeBackground] raw output:", output);

    const url =
      typeof output === "string"
        ? output
        : Array.isArray(output)
        ? output[0]
        : null;

    if (!url) {
      throw new Error("Replicate returned no output URL");
    }

    return { clean: url };
  } catch (err: any) {
    const detail =
      err?.response?.data?.detail ||
      err?.response?.data?.title ||
      err?.message ||
      String(err);

    console.error("[removeBackground] ERROR:", detail);
    throw new Error(detail);
  }
}
