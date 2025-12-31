import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Pin model version (important)
const MODEL =
  "cjwbw/rembg@34bd50c3cdcf667a839abdcdde7201d5b39bbebb54aa037da542ee6e670d9786";

export async function removeBackground(imageUrl: string) {
  const output = await replicate.run(MODEL, {
    input: {
      image: imageUrl,
    },
  });

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
