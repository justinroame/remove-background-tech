import "server-only";
import Replicate from "replicate";

const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  // Convert file → base64 data URL
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const output = await replicate.run(MODEL, {
    input: {
      image: dataUrl,
    },
  });

  /**
   * 851-labs returns IMAGE DATA, not a URL
   * Shape: string (base64) OR string[]
   */
  let imageBase64: string | null = null;

  if (typeof output === "string") {
    imageBase64 = output;
  } else if (Array.isArray(output) && typeof output[0] === "string") {
    imageBase64 = output[0];
  }

  if (!imageBase64) {
    throw new Error("Replicate returned no image data");
  }

  // Ensure browser-usable data URL
  if (!imageBase64.startsWith("data:image")) {
    imageBase64 = `data:image/png;base64,${imageBase64}`;
  }

  return { clean: imageBase64 };
}
