import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result.trim();
}

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const output = await replicate.run(MODEL, {
    input: {
      image: base64,
    },
  });

  let url: string | null = null;

  // ✅ STRING (older SDK / local)
  if (typeof output === "string") {
    url = output;
  }

  // ✅ ARRAY fallback
  else if (Array.isArray(output) && typeof output[0] === "string") {
    url = output[0];
  }

  // ✅ STREAM (this is what you're getting now)
  else if (output instanceof ReadableStream) {
    const text = await streamToString(output);
    if (text.startsWith("http")) {
      url = text;
    }
  }

  if (!url) {
    console.error("Unparsed Replicate output:", output);
    throw new Error("Replicate returned no usable image");
  }

  return { clean: url };
}
