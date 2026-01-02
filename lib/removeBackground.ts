import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

/**
 * IMPORTANT:
 * Replicate API REQUIRES a pinned version.
 * Unversioned model slugs can 404 in production.
 */
const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  // Convert File → base64 data URL
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

  const output = await replicate.run(MODEL, {
    input: {
      image: base64Image, // correct key
    },
  });

  // Handle all known output shapes
  let result: string | undefined;

  if (typeof output === "string") {
    result = output;
  } else if (Array.isArray(output)) {
    result = output[0];
  } else if (output && typeof output === "object") {
    const obj = output as any;
    result =
      obj.image ??
      obj.output ??
      (Array.isArray(obj.image) ? obj.image[0] : undefined) ??
      (Array.isArray(obj.output) ? obj.output[0] : undefined);
  }

  if (!result || typeof result !== "string") {
    console.error("Unexpected Replicate output:", output);
    throw new Error("Replicate returned no usable image");
  }

  return { clean: result };
}
