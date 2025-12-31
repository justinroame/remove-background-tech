// lib/removeBackground.ts
import Replicate from "replicate";

type ProcessOptions = {
  watermark: boolean;
};

type ProcessResult = {
  watermarked: string;
  clean: string;
};

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

/**
 * Uses Replicate "cjwbw/rembg" to remove background.
 * Returns URLs (Replicate delivery URLs).
 *
 * NOTE: This returns the same URL for both watermarked and clean.
 * Your UI already supports “preview vs clean download”; watermarking can be applied client-side
 * or we can add server-side watermarking once the pipeline is working.
 */
export async function processImage(
  file: File,
  _options: ProcessOptions
): Promise<ProcessResult> {
  const token = requireEnv("REPLICATE_API_TOKEN");

  const replicate = new Replicate({ auth: token });

  // Convert file -> base64 DATA URL (most Replicate image inputs accept this)
  const ab = await file.arrayBuffer();
  const b64 = Buffer.from(ab).toString("base64");
  const dataUrl = `data:${file.type || "image/png"};base64,${b64}`;

  // Call Replicate
  const output = await replicate.run("cjwbw/rembg", {
    input: { image: dataUrl },
  });

  // Output can be string or array depending on model version
  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output) && typeof output[0] === "string"
      ? output[0]
      : null;

  if (!url) {
    throw new Error(
      `Unexpected Replicate output shape: ${JSON.stringify(output).slice(0, 500)}`
    );
  }

  return {
    watermarked: url,
    clean: url,
  };
}
