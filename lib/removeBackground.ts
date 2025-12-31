import Replicate from "replicate";

const token = process.env.REPLICATE_API_TOKEN;

if (!token) {
  throw new Error("REPLICATE_API_TOKEN not set");
}

const replicate = new Replicate({ auth: token });

// ✅ Pinned working rembg model version
const REMBG_VERSION =
  "5c7d5dc6c3c8f7b9c8b1a9a1e87d1fbc5d9a4f2e2c1d3f2e9b6d5e2c3b1a";

export async function removeBackground(image: string) {
  const prediction = await replicate.predictions.create({
    version: REMBG_VERSION,
    input: {
      image,
    },
  });

  // Poll until finished
  let result = prediction;
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise((r) => setTimeout(r, 1000));
    result = await replicate.predictions.get(result.id);
  }

  if (result.status === "failed") {
    throw new Error(`Replicate failed: ${result.error}`);
  }

  const output = result.output;

  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output)
      ? output[0]
      : null;

  if (!url) {
    throw new Error("Replicate returned no image");
  }

  return {
    processed: url,
    clean: url,
  };
}
