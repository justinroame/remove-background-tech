"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleFile(file: File) {
    let compressed = file;

    if (file.size > 5 * 1024 * 1024) {
      try {
        const opts = { maxSizeMB: 4, maxWidthOrHeight: 1024, useWebWorker: true };
        compressed = await imageCompression(file, opts);
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
      const res = await fetch("/api/remove-background", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      router.push(
        `/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(
          data.clean
        )}`
      );
      return;
    } catch (err: any) {
      setError(err.message);
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

  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-20">
        <div className="flex flex-col items-center text-center">

          {/* Sparkle Icon */}
          <div className="mb-4 md:mb-8 flex justify-end w-full">
            <Sparkles className="size-8 md:size-10 text-yellow-500" />
          </div>

          {/* HERO TEXT */}
          <h1 className="mb-6 md:mb-8 text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
            Upload an image to
            <br />
            remove the background
          </h1>

          {/* UPLOAD BOX */}
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 md:p-10 mb-6 md:mb-10 w-full max-w-lg bg-white hover:border-blue-500 transition cursor-pointer"
            onDrop={onDrop}
            onDragOver={allowDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            <Button
              className="rounded-full bg-blue-600 px-10 py-5 md:px-12 md:py-6 text-lg font-medium text-white hover:bg-blue-700"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload Image"
              )}
            </Button>
          </div>

          {/* DRAG TEXT */}
          <p className="mb-2 text-sm md:text-base font-medium text-gray-700">
            or drag an image here
          </p>

          {error && <p className="text-red-600 mt-4 md:mt-6">{error}</p>}

          {/* SAMPLE IMAGES SECTION */}
          <div className="space-y-3 md:space-y-4 mt-10 md:mt-16">
            <p className="text-sm font-medium text-gray-700">No image? Try one of these:</p>

            <div className="flex gap-3 justify-center">
              <img
                src="/woman-in-pink-dress.jpg"
                className="size-16 md:size-20 rounded-xl object-cover cursor-pointer"
                onClick={() => handleSampleClick("/woman-in-pink-dress.jpg")}
              />
              <img
                src="/iphone-product.jpg"
                className="size-16 md:size-20 rounded-xl object-cover cursor-pointer"
                onClick={() => handleSampleClick("/iphone-product.jpg")}
              />
              <img
                src="/silver-sports-car.jpg"
                className="size-16 md:size-20 rounded-xl object-cover cursor-pointer"
                onClick={() => handleSampleClick("/silver-sports-car.jpg")}
              />
              <img
                src="/watch-closeup.jpg"
                className="size-16 md:size-20 rounded-xl object-cover cursor-pointer"
                onClick={() => handleSampleClick("/watch-closeup.jpg")}
              />
            </div>
          </div>

          {/* TERMS */}
          <p className="mt-8 md:mt-12 max-w-2xl text-xs text-gray-600">
            By uploading an image you agree to our{" "}
            <Link href="/legal" className="underline hover:text-gray-800">
              Terms & Privacy
            </Link>.
          </p>

          {/* CONTACT */}
          <p className="mt-2 max-w-2xl text-xs text-gray-600">
            Need help?{" "}
            <Link href="/contact" className="underline hover:text-gray-800 font-medium">
              Contact Us
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
