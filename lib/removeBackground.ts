// lib/removeBackground.ts

import "server-only";

/**
 * Replicate – 851 Labs Background Remover
 * Uses pinned version + robust output parsing
 */
const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

export async function removeBackground(imageUrl: string) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  try {
    const { default: Replicate } = await import("replicate");

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(MODEL, {
      input: {
        file: imageUrl,
      },
    });

    console.log("[Replicate raw output]", output);

    let url: string | null = null;

    if (typeof output === "string") {
      url = output;
    } else if (Array.isArray(output) && typeof output[0] === "string") {
      url = output[0];
    } else if (typeof output === "object" && output !== null) {
      url =
        (output as any).output ||
        (output as any).image ||
        (output as any).url ||
        null;
    }

    if (!url) {
      throw new Error("Replicate returned no valid output URL");
    }

    return { clean: url };
  } catch (err: any) {
    console.error("[removeBackground] ERROR:", err);
    throw new Error(
      err?.response?.data?.detail ||
        err?.message ||
        "Background removal failed"
    );
  }
}
