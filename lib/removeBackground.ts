// lib/removeBackground.ts
import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  // Convert File → base64 data URL (Replicate supports this)
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const output = await replicate.run(
    "851-labs/background-remover", // ✅ CORRECT SLUG
    {
      input: {
        image: base64, // ✅ CORRECT INPUT KEY
      },
    }
  );

  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output) && typeof output[0] === "string"
      ? output[0]
      : null;

  if (!url) {
    throw new Error("Replicate returned no valid output URL");
  }

  return { clean: url };
}
