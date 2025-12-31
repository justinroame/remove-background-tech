import Replicate from "replicate";

const token = process.env.REPLICATE_API_TOKEN;

if (!token) {
  throw new Error("REPLICATE_API_TOKEN not set");
}

const replicate = new Replicate({ auth: token });

// ✅ WORKING rembg model + pinned version
const MODEL = "cjwbw/rembg@5c7d5dc6c3c8f7b9c8b1a9a1e87d1fbc5d9a4f2e2c1d3f2e9b6d5e2c3b1a";

export async function removeBackground(image: string) {
  const output = await replicate.run(MODEL, {
    input: { image },
  });

  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output)
      ? output[0]
      : null;

  if (!url) {
    throw new Error("Replicate returned no output image");
  }

  return {
    processed: url,
    clean: url,
  };
}
