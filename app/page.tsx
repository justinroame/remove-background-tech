// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import {
  getGuestUploadCount,
  incrementGuestUpload,
  MAX_GUEST_UPLOADS,
} from "@/lib/guestLimit";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  async function handleFile(file: File) {
    if (!user) {
      const count = getGuestUploadCount();
      if (count >= MAX_GUEST_UPLOADS) {
        return router.push("/auth/signup");
      }
      incrementGuestUpload();
    }

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
        `/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(data.clean)}`
      );
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
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is this background remover free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes — you can remove background from images instantly with no signup required."
                }
              }
            ]
          }),
        }}
      />

      <main className="mx-auto max-w-4xl px-6 py-10 md:py-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="sr-only">Remove Background from Image – Free AI Tool Online</h1>
          <div className="mb-4 md:mb-8 flex justify-end w-full">
            <Sparkles className="size-8 md:size-10 text-yellow-500" />
          </div>
          <h2 className="mb-6 md:mb-8 text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
            Upload an image to<br />
            <span className="text-blue-600">remove the background</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mb-6">
            Instantly remove background from any image using free AI. Upload a photo and download a clean transparent PNG in seconds.
          </p>

          <div
            className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 md:p-10 mb-6 md:mb-10 w-full max-w-lg bg-white hover:border-blue-500 transition cursor-pointer"
            onDrop={onDrop}
            onDragOver={allowDrop}
            aria-label="Upload or drop image to remove background"
          >
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Select image to remove background"
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

          <p className="mb-2 text-sm md:text-base font-medium text-gray-700">
            or drag and drop an image to remove the background
          </p>
          {error && <p className="text-red-600 mt-4 md:mt-6">{error}</p>}

          <div className="space-y-3 md:space-y-4 mt-10 md:mt-16">
            <p className="text-sm font-medium text-gray-700">No image? Try one of these:</p>
            <div className="flex gap-3 justify-center">
              <img src="/woman-in-pink-dress.jpg" alt="Portrait" className="size-16 md:size-20 rounded-xl object-cover cursor-pointer hover:ring-4 hover:ring-blue-300 transition" onClick={() => handleSampleClick("/woman-in-pink-dress.jpg")} loading="lazy" />
              <img src="/iphone-product.jpg" alt="Product" className="size-16 md:size-20 rounded-xl object-cover cursor-pointer hover:ring-4 hover:ring-blue-300 transition" onClick={() => handleSampleClick("/iphone-product.jpg")} loading="lazy" />
              <img src="/silver-sports-car.jpg" alt="Car" className="size-16 md:size-20 rounded-xl object-cover cursor-pointer hover:ring-4 hover:ring-blue-300 transition" onClick={() => handleSampleClick("/silver-sports-car.jpg")} loading="lazy" />
              <img src="/watch-closeup.jpg" alt="Watch" className="size-16 md:size-20 rounded-xl object-cover cursor-pointer hover:ring-4 hover:ring-blue-300 transition" onClick={() => handleSampleClick("/watch-closeup.jpg")} loading="lazy" />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 w-full max-w-2xl text-center text-xs text-gray-600 space-y-2">
            <p>
              By uploading an image you agree to our{" "}
              <Link href="/legal" className="underline hover:text-gray-800">
                Terms & Privacy
              </Link>
              .
            </p>
            <p className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/contact" className="underline hover:text-gray-800 font-medium">
                Contact Us
              </Link>
              {" • "}
              <Link href="/blog" className="underline hover:text-gray-800 font-medium">
                Blog
              </Link>
              {" • "}
              <Link href="/pricing" className="underline hover:text-gray-800 font-medium">
                Pricing
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
