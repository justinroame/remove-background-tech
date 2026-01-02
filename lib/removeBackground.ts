import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Pin the version to avoid endpoint / SDK ambiguity
const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

// Read a ReadableStream into a Buffer (Node-safe)
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  // Convert input file → base64 data URL
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const base64Input = `data:${file.type};base64,${inputBuffer.toString("base64")}`;

  const output = await replicate.run(MODEL, {
    input: {
      image: base64Input, // correct key for this model
    },
  });

  // 🔴 Replicate returns BINARY PNG as a stream in Node/Vercel
  if (output instanceof ReadableStream) {
    const pngBuffer = await streamToBuffer(output);
    const pngBase64 = pngBuffer.toString("base64");

    return {
      clean: `data:image/png;base64,${pngBase64}`,
    };
  }

  // Fallbacks (rare, but safe)
  if (Array.isArray(output) && output[0] instanceof ReadableStream) {
    const pngBuffer = await streamToBuffer(output[0]);
    const pngBase64 = pngBuffer.toString("base64");

    return {
      clean: `data:image/png;base64,${pngBase64}`,
    };
  }

  if (typeof output === "string") {
    return { clean: output };
  }

  console.error("Unexpected Replicate output:", output);
  throw new Error("Replicate returned no usable image");
}
