import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// ✅ MUST include version — fixes the 404 permanently
const MODEL_VERSION =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const output = await replicate.run(MODEL_VERSION, {
    input: {
      image: base64, // correct for this model
    },
  });

  let url: string | null = null;

  if (typeof output === "string") {
    url = output;
  } else if (Array.isArray(output) && typeof output[0] === "string") {
    url = output[0];
  }

  if (!url) {
    console.error("Replicate output:", output);
    throw new Error("Replicate returned no usable image");
  }

  return { clean: url };
}
