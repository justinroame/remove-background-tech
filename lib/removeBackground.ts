import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN not set");
}

/**
 * Accepts:
 * - public image URL
 * - data:image/... base64
 */
export async function removeBackground(image: string) {
  const output = await replicate.run("cjwbw/rembg", {
    input: { image },
  });

  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output)
      ? output[0]
      : null;

  if (!url) {
    throw new Error("Invalid Replicate output");
  }

  return {
    processed: url,
    clean: url,
  };
}
