import "server-only";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const MODEL =
  "851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc";

const SUPPORTED_INPUT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/gif",
  "image/tiff",
]);

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

async function normalizeToInputDataUrl(file: File): Promise<string> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const type = file.type?.toLowerCase() || "";

  if (!type || !SUPPORTED_INPUT_TYPES.has(type)) {
    throw new Error("Unsupported image format. Please upload JPG, PNG, WEBP, HEIC, AVIF, GIF, or TIFF.");
  }

  const requiresConversion = ["image/heic", "image/heif", "image/avif", "image/tiff", "image/gif"].includes(type);

  if (!requiresConversion) {
    return `data:${type};base64,${inputBuffer.toString("base64")}`;
  }

  try {
    const sharp = (await import("sharp")).default;
    const converted = await sharp(inputBuffer).jpeg({ quality: 92 }).toBuffer();
    return `data:image/jpeg;base64,${converted.toString("base64")}`;
  } catch {
    throw new Error("We couldn't read that image format. Please convert it to JPG or PNG and try again.");
  }
}

export async function removeBackground(file: File) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN is not set");
  }

  const base64Input = await normalizeToInputDataUrl(file);

  let output: unknown;
  try {
    output = await replicate.run(MODEL, {
      input: {
        image: base64Input,
      },
    });
  } catch (err: any) {
    const msg = String(err?.message || "");

    if (/quota/i.test(msg) || /payment required/i.test(msg) || /insufficient/i.test(msg)) {
      throw new Error("Image processing quota reached. Please retry in a moment or contact support.");
    }

    if (/cannot identify image file/i.test(msg) || /unsupported/i.test(msg)) {
      throw new Error("We couldn't process that image format. Please try JPG or PNG.");
    }

    throw err;
  }

  if (output instanceof ReadableStream) {
    const pngBuffer = await streamToBuffer(output);
    const pngBase64 = pngBuffer.toString("base64");

    return {
      clean: `data:image/png;base64,${pngBase64}`,
    };
  }

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
  throw new Error("Image processing failed. Please try another image.");
}
