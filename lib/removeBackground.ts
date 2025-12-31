import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN not set");
}

/**
 * Runs background removal using Replicate rembg
 * Accepts RAW base64 (no data: prefix)
 */
export async function removeBackground(base64Image: string) {
  const output = await replicate.run(
    "cjwbw/rembg:latest",
    {
      input: {
        image: base64Image,
      },
    }
  );

  if (typeof output !== "string") {
    throw new Error("Unexpected Replicate output");
  }

  return {
    processed: output,
    clean: output,
  };
}
