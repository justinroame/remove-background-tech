// lib/removeBackground.ts
import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Uses Replicate's OFFICIAL background removal model.
 * This avoids deprecated community models entirely.
 */
export async function removeBackground(imageUrl: string) {
  console.log("[removeBackground] Image URL:", imageUrl);

  const output = await replicate.run(
    "replicate/background-removal",
    {
      input: {
        image: imageUrl,
      },
    }
  );

  console.log("[removeBackground] Output:", output);

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
}
