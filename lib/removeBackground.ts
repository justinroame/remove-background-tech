import Replicate from "replicate";

const hasReplicate =
  typeof process.env.REPLICATE_API_TOKEN === "string" &&
  process.env.REPLICATE_API_TOKEN.length > 10;

let replicate: Replicate | null = null;

if (hasReplicate) {
  replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
  });
}

/**
 * Attempts background removal.
 * If Replicate fails, returns original image so the editor still works.
 */
export async function removeBackground(image: string) {
  if (replicate) {
    try {
      const output = await replicate.run("cjwbw/rembg", {
        input: { image },
      });

      const url =
        typeof output === "string"
          ? output
          : Array.isArray(output)
          ? output[0]
          : null;

      if (url) {
        return {
          processed: url,
          clean: url,
        };
      }
    } catch (err) {
      console.error("Replicate failed, falling back:", err);
    }
  }

  // Fallback: return original image
  return {
    processed: image,
    clean: image,
  };
}
