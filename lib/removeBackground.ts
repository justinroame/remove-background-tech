import "server-only";
import Replicate from "replicate";

// FORCE REDEPLOY JAN 2026 — REMOVE AFTER CONFIRM
const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

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

  // ✅ FIX: handle array output
  let url: string | null = null;

  if (typeof output === "string") {
    url = output;
  } else if (Array.isArray(output) && typeof output[0] === "string") {
    url = output[0];
  }

  if (!url) {
    throw new Error("Replicate returned no valid output URL");
  }

  return { clean: url };
}
