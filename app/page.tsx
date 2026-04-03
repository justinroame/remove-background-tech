"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { incrementGuestUpload } from "@/lib/guestLimit";
import { clearEditorTransfer, setEditorTransfer } from "@/lib/editorTransfer";

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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  function clearEditorStorage() {
    clearEditorTransfer();
  }

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

  async function handleFile(file: File) {
    clearEditorStorage();
    if (!user) incrementGuestUpload();

    setError(null);
    setLoading(true);

    try {
      const normalized = await normalizeForUpload(file);

      const form = new FormData();
      form.append("image", normalized);

      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || !data?.clean) {
        throw new Error(data?.error || "Background removal failed");
      }

      setEditorTransfer(URL.createObjectURL(normalized), data.clean);
      router.push("/editor");
    } catch (err: any) {
      clearEditorStorage();
      setError(err?.message || "Background removal failed");
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleSampleClick(imagePath: string) {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const file = new File([blob], "sample.jpg", { type: blob.type });
      handleFile(file);
    } catch {
      setError("Failed to load sample image");
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-20">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex justify-end w-full">
            <Sparkles className="size-8 text-yellow-500" />
          </div>

          <h2 className="mb-6 text-3xl md:text-5xl font-bold text-gray-800">
            Upload an image to
            <br />
            <span className="text-blue-600">remove the background</span>
          </h2>

          <p className="text-gray-600 mb-6">Upload a photo and download a clean transparent PNG for product photos, logos, and ecommerce images.</p>

          <div
            className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-6 w-full max-w-lg bg-white hover:border-blue-500 transition cursor-pointer"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button className="rounded-full bg-blue-600 px-10 py-5 text-lg text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing…
                </>
              ) : (
                "Upload Image"
              )}
            </Button>
          </div>

          {error && <p className="text-red-600 mt-4">{error}</p>}

          <div className="mt-10">
            <p className="text-sm font-medium text-gray-700 mb-3">No image? Try one of these:</p>
            <div className="flex gap-3 justify-center">
              {["/woman-in-pink-dress.jpg", "/iphone-product.jpg", "/silver-sports-car.jpg", "/watch-closeup.jpg"].map(
                (src) => (
                  <img
                    key={src}
                    src={src}
                    className="size-16 rounded-xl object-cover cursor-pointer hover:ring-4 hover:ring-blue-300"
                    onClick={() => handleSampleClick(src)}
                  />
                )
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-xs text-gray-600">
            <p>
              By uploading an image you agree to our{" "}
              <Link href="/legal" className="underline">
                Terms & Privacy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
