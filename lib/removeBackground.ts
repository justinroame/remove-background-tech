// lib/removeBackground.ts
import Replicate from "replicate";

type ProcessOptions = {
  watermark: boolean;
};

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

const replicate = new Replicate({ auth: REPLICATE_TOKEN });

/**
 * Replicate's cjwbw/rembg example uses an explicit version string like:
 * "cjwbw/rembg:<version_hash>"
 * See Replicate's model examples/docs. :contentReference[oaicite:0]{index=0}
 */
const REMBG_MODEL =
  "cjwbw/rembg:34bd50c3cdcf667a839abdcdde7201d5b39bbebb54aa037da542ee6e670d9786";

export async function processImage(
  file: File,
  options: ProcessOptions
): Promise<{ watermarked: string; clean: string }> {
  // Convert File → base64 data URL
  const arrayBuffer = await file.arrayBuffer();
  const b64 = Buffer.from(arrayBuffer).toString("base64");
  const mime = file.type || "image/png";
  const dataUrl = `data:${mime};base64,${b64}`;

  // Run Replicate
  const output = await replicate.run(REMBG_MODEL, {
    input: {
      // cjwbw/rembg "Input image" is called "image" in the Node examples. :contentReference[oaicite:1]{index=1}
      image: dataUrl,
    },
  });

  const cleanUrl =
    typeof output === "string"
      ? output
      : Array.isArray(output)
      ? output[0]
      : null;

  if (!cleanUrl) {
    throw new Error("Replicate returned no output image URL");
  }

  // If you want watermarking later, we can add a proper /api/watermark route
  // For now, keep the contract: watermarked + clean
  return {
    watermarked: cleanUrl,
    clean: cleanUrl,
  };
}
