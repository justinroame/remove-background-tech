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
    "851-labs/background-remover",
    {
      input: {
        image: base64, // ← try image first (works for 851-labs)
      },
    }
  );

  const url =
    typeof output === "string"
      ? output
      : Array.isArray(output)
      ? output[0]
      : (output as any)?.output ||
        (output as any)?.image ||
        null;

  if (!url) {
    throw new Error("Replicate returned no valid output URL");
  }

  return { clean: url };
}
