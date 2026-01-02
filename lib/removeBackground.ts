import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

export async function removeBackground(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

  const output = await replicate.run(MODEL, {
    input: {
      image: base64Image,
    },
  });

  // 🔍 TEMP DEBUG — DO NOT PARSE
  console.log("REPLICATE RAW OUTPUT:", output);

  return {
    // send raw output to client so we can inspect
    debug: output,
  };
}
