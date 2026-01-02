// lib/removeBackground.ts

/**
 * Remove background using Replicate (851 Labs background remover).
 * - Server-only
 * - Dynamic import (prevents build errors)
 * - Handles string OR array output
 */

import "server-only";

const MODEL = "851-labs/background-remover";

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
      input: { image: imageUrl },
    });

    let url: string | null = null;

    if (typeof output === "string") {
      url = output;
    } else if (Array.isArray(output) && typeof output[0] === "string") {
      url = output[0];
    }

    if (!url) {
      throw new Error("Replicate returned no valid output URL");
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
