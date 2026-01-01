// lib/removeBackground.ts
import Replicate from "replicate";

const token = process.env.REPLICATE_API_TOKEN;
if (!token) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

const replicate = new Replicate({ auth: token });

/**
 * Remove background using Replicate rembg.
 * Expects a PUBLIC HTTPS image URL.
 */
export async function removeBackground(imageUrl: string) {
  console.log("[removeBackground] input url:", imageUrl);

  // Known-stable rembg version (URL input)
  const model =
    "cjwbw/rembg:fb8af171cfa5504d5ceafdba8c0fe0c84b4c8b2ce1a42a7b1c304af22aa32b3a";

  try {
    const output = await replicate.run(model, {
      input: { image: imageUrl },
    });

    console.log("[removeBackground] replicate output:", output);

    const url =
      typeof output === "string"
        ? output
        : Array.isArray(output)
        ? output[0]
        : null;

    if (!url) throw new Error("Replicate returned no output url");

    return { processed: url, clean: url };
  } catch (err: any) {
    console.error("[removeBackground] ERROR:", err);
    // Replicate SDK sometimes nests useful info
    const msg =
      err?.message ||
      err?.response?.data?.detail ||
      err?.response?.data?.error ||
      "Replicate processing failed";
    throw new Error(msg);
  }
}
