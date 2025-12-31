import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN not set");
}

/**
 * Runs background removal via Replicate
 * Returns a public image URL
 */
export async function removeBackground(imageBase64: string) {
  const output = await replicate.run(
    "cjwbw/rembg:latest",
    {
      input: {
        image: imageBase64,
      },
    }
  );

  // rembg returns a single image URL
  if (typeof output !== "string") {
    throw new Error("Unexpected Replicate output");
  }

  return {
    processed: output,
    clean: output,
  };
}
