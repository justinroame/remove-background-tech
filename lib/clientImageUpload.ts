"use client";

import imageCompression from "browser-image-compression";
import { setEditorTransfer } from "@/lib/editorTransfer";

const MAX_UPLOAD_MB = 20;
const MAX_DIMENSION = 2048;
const SERVER_CONVERTIBLE_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
  "image/bmp",
  "image/webp",
]);

async function convertToJpegWithCanvas(file: File): Promise<File> {
  let width = 0;
  let height = 0;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable for image conversion.");

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    width = Math.max(1, Math.round(bitmap.width * scale));
    height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
  } catch {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      width = Math.max(1, Math.round(img.naturalWidth * scale));
      height = Math.max(1, Math.round(img.naturalHeight * scale));
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });
  if (!blob) throw new Error("Could not convert image.");

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.jpg`, {
    type: "image/jpeg",
  });
}

async function normalizeForUpload(file: File): Promise<File> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`File is too large. Please upload an image under ${MAX_UPLOAD_MB}MB.`);
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  let normalized: File;
  try {
    normalized = await convertToJpegWithCanvas(file);
  } catch {
    if (SERVER_CONVERTIBLE_TYPES.has(file.type.toLowerCase())) {
      normalized = file;
    } else {
      throw new Error("We couldn't read that image format. Please convert it to JPG or PNG and try again.");
    }
  }

  const isServerConvertibleOriginal =
    normalized === file && SERVER_CONVERTIBLE_TYPES.has(file.type.toLowerCase());

  if (!isServerConvertibleOriginal && normalized.size > 5 * 1024 * 1024) {
    normalized = await imageCompression(normalized, {
      maxSizeMB: 4,
      maxWidthOrHeight: MAX_DIMENSION,
      useWebWorker: true,
    });
  }

  return normalized;
}

export async function processEditorImage(file: File) {
  const normalized = await normalizeForUpload(file);

  const form = new FormData();
  form.append("image", normalized);

  const res = await fetch("/api/remove-background", {
    method: "POST",
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.clean) {
    throw new Error(data?.error || "Background removal failed");
  }

  const imageUrl = URL.createObjectURL(normalized);
  setEditorTransfer(imageUrl, data.clean);

  return {
    cleanImage: data.clean as string,
    originalImage: imageUrl,
  };
}
