import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Pin the version to avoid endpoint churn
const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

// Helper: Read stream → string
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

// Helper: extract URL from ANY Replicate output
async function extractUrl(output: any): Promise<string | null> {
  // string
  if (typeof output === "string") return output;

  // array
  if (Array.isArray(output)) {
    for (const item of output) {
      const url = await extractUrl(item);
      if (url) return url;
    }
  }

  // stream
  if (output instanceof ReadableStream) {
    const text = await streamToString(output);
    if (text.startsWith("http")) return text;
  }

  // object (most common on Vercel)
  if (typeof output === "object" && output !== null) {
    if ("output" in output) {
      return extractUrl((output as any).output);
    }
    if ("image" in output) {
      return extractUrl((output as any).image);
    }
    if ("url" in output && typeof output.url === "string") {
      return output.url;
    }
  }

  return null;
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

  const url = await extractUrl(output);

  if (!url) {
    console.error("UNPARSEABLE REPLICATE OUTPUT:", output);
    throw new Error("Replicate returned no usable image");
  }

  return { clean: url };
}
