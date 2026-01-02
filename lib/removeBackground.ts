// lib/removeBackground.ts
import "server-only";
import Replicate from "replicate";

/**
 * IMPORTANT:
 * Replicate REQUIRES a pinned version in production.
 * Unversioned calls intermittently 404.
 */
const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function removeBackground(base64Image: string) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  const output = await replicate.run(MODEL, {
    input: {
      file: base64Image, // REQUIRED KEY
    },
  });

  // Replicate returns a single URL string
  if (typeof output !== "string") {
    throw new Error("Replicate returned invalid output");
  }

  return {
    clean: output,
  };
}
