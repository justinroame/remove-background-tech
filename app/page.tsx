'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import imageCompression from 'browser-image-compression';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setProcessed(data.processed);
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

  // ✅ Clicking on a sample image loads & sends it to API
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

  // ✅ Drag and drop support
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
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="relative size-9">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 opacity-30" />
                <div className="absolute inset-1 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white">
                    <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="7" y="7" width="10" height="10" fill="currentColor" rx="1" />
                  </svg>
                </div>
              </div>
              <span className="text-lg font-semibold">
                <span className="text-gray-800">remove-background</span>
                <span className="text-blue-600">.tech</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm text-gray-700 hover:text-gray-900">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-gray-700 hover:text-gray-900">Log in</a>
            <a href="#" className="text-sm text-gray-700 hover:text-gray-900">Sign up</a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="flex flex-col items-center text-center">

          <div className="mb-8 flex justify-end w-full">
            <Sparkles className="size-10 text-yellow-500" />
          </div>

          <h1 className="mb-8 text-4xl font-bold text-gray-800 md:text-5xl">
            Upload an image to
            <br />
            remove the background
          </h1>

          {/* Upload Button + Drop Zone */}
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-2xl p-10 mb-10 w-full max-w-lg bg-white hover:border-blue-500 transition cursor-pointer"
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
              className="rounded-full bg-blue-600 px-12 py-6 text-lg font-medium text-white hover:bg-blue-700"
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

          <p className="mb-2 text-base font-medium text-gray-700">or drag an image here</p>
          <p className="mb-16 text-sm text-gray-600">
            paste image or <span className="underline">URL</span>
          </p>

          {/* Result */}
          {processed && (
            <div className="mt-12 text-center w-full">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your image is ready!</h2>
              <div className="max-w-md mx-auto mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <img src={processed} alt="Result" className="w-full h-auto" />
              </div>

              <button
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = processed;
                  a.download = "removed-background.png";
                  a.click();
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Download PNG
              </button>
            </div>
          )}

          {error && <p className="text-red-600 mt-6">{error}</p>}

          {/* ✅ Sample Images (Clickable + Draggable) */}
          <div className="space-y-4 mt-16">
            <p className="text-sm font-medium text-gray-700">No image? Try one of these:</p>

            <div className="flex gap-3 justify-center">
              <img
                src="/woman-in-pink-dress.jpg"
                className="size-20 rounded-xl object-cover cursor-pointer"
                draggable
                onClick={() => handleSampleClick('/woman-in-pink-dress.jpg')}
              />

              <img
                src="/iphone-product.jpg"
                className="size-20 rounded-xl object-cover cursor-pointer"
                draggable
                onClick={() => handleSampleClick('/iphone-product.jpg')}
              />

              <img
                src="/silver-sports-car.jpg"
                className="size-20 rounded-xl object-cover cursor-pointer"
                draggable
                onClick={() => handleSampleClick('/silver-sports-car.jpg')}
              />

              <img
                src="/watch-closeup.jpg"
                className="size-20 rounded-xl object-cover cursor-pointer"
                draggable
                onClick={() => handleSampleClick('/watch-closeup.jpg')}
              />
            </div>
          </div>

          <p className="mt-12 max-w-2xl text-xs text-gray-600">
            By uploading an image or URL you agree to our{" "}
            <a href="#" className="underline">Terms of Service</a>. To learn more about how remove-background.tech handles your personal data, check our{" "}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
