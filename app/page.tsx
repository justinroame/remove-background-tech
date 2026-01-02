// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { incrementGuestUpload } from "@/lib/guestLimit";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  function clearEditorStorage() {
    try {
      sessionStorage.removeItem("editor-image");
      sessionStorage.removeItem("editor-clean");
    } catch {}
  }

  async function handleFile(file: File) {
    clearEditorStorage();

    // ✅ Guests are allowed to upload and go to editor
    if (!user) {
      incrementGuestUpload(); // track silently, no redirect
    }

    let compressed = file;
    if (file.size > 5 * 1024 * 1024) {
      try {
        compressed = await imageCompression(file, {
          maxSizeMB: 4,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
      } catch {
        setError("Compression failed.");
        return;
      }
    }

    setError(null);
    setLoading(true);

    const form = new FormData();
    form.append("image", compressed);

    try {
      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || !data?.clean) {
        throw new Error(data?.error || "Background removal failed");
      }

      // Store original + clean image for editor
      sessionStorage.setItem(
        "editor-image",
        URL.createObjectURL(compressed)
      );
      sessionStorage.setItem("editor-clean", data.clean);

      // ✅ Always go to editor (guest or logged-in)
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

          <p className="text-gray-600 mb-6">
            Upload a photo and download a clean transparent PNG.
          </p>

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
            <Button
              className="rounded-full bg-blue-600 px-10 py-5 text-lg text-white"
              disabled={loading}
            >
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
            <p className="text-sm font-medium text-gray-700 mb-3">
              No image? Try one of these:
            </p>
            <div className="flex gap-3 justify-center">
              {[
                "/woman-in-pink-dress.jpg",
                "/iphone-product.jpg",
                "/silver-sports-car.jpg",
                "/watch-closeup.jpg",
              ].map((src) => (
                <img
                  key={src}
                  src={src}
                  className="size-16 rounded-xl object-cover cursor-pointer hover:ring-4 hover:ring-blue-300"
                  onClick={() => handleSampleClick(src)}
                />
              ))}
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
