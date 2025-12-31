// lib/removeBackground.ts
import "server-only";
import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Known-working pinned model
const MODEL =
  "cjwbw/rembg@34bd50c3cdcf667a839abdcdde7201d5b39bbebb54aa037da542ee6e670d9786";

export async function removeBackground(image: string) {
  console.log("[replicate] input image:", image);

  const output = await replicate.run(MODEL, {
    input: { image },
  });

  console.log("[replicate] raw output:", output);

  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output)
      ? output[0]
      : null;

  if (!url) {
    throw new Error("Replicate returned no output image");
  }

  // 🔑 CONTRACT THAT YOUR APP EXPECTS
  return {
    processed: url,
    clean: url,
  };
}
