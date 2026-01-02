import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL = "851-labs/background-remover";

async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks).toString("utf-8");
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

  // ✅ Handle ALL possible Replicate outputs
  if (typeof output === "string") {
    url = output;
  } else if (Array.isArray(output)) {
    url = output.find((v) => typeof v === "string") ?? null;
  } else if (output instanceof ReadableStream) {
    const text = await streamToString(output);
    try {
      const parsed = JSON.parse(text);
      url =
        parsed?.output ??
        parsed?.image ??
        (Array.isArray(parsed) ? parsed[0] : null);
    } catch {
      url = text.startsWith("http") ? text : null;
    }
  }

  if (!url) {
    console.error("❌ Unusable Replicate output:", output);
    throw new Error("Replicate returned no usable image");
  }

  return { clean: url };
}
