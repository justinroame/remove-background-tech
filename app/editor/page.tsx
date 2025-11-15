"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

function EditorContent() {
  const params = useSearchParams();
  const initialImg = params.get("img");

  const [imageUrl, setImageUrl] = useState<string | null>(initialImg);
  const [processing, setProcessing] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<
    "transparent" | "white" | "black"
  >("transparent");

  /** ===========================
   *  PROCESS NEW UPLOADED IMAGE
   *  ========================== */
  async function handleNewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.processed);
    } catch (err) {
      console.error("Reprocess error:", err);
    } finally {
      setProcessing(false);
    }
  }

  /** ======================
   *  DOWNLOAD FINAL IMAGE
   *  ===================== */
  async function handleDownload() {
    if (!imageUrl) return;

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d")!;

      // background color
      if (selectedBackground === "white") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (selectedBackground === "black") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // transparent → no fill
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">

      {/* ================= HEADER ================= */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="2" rx="2" opacity="0.4" />
                  <rect x="10" y="10" width="12" height="12" fill="currentColor" rx="2" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-gray-700">remove-background</span>
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-bold">
                  .tech
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm text-gray-700 hover:text-gray-900">
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">
              Log in
            </Link>
            <Link href="/signup" className="text-sm text-gray-700 hover:text-gray-900">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ================= TOP TOOLBAR ================= */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Background
          </span>

          <Button
            onClick={handleDownload}
            className="rounded-full bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download className="mr-2 size-4" />
            Download
          </Button>
        </div>
      </div>

      {/* ================= MAIN WORK AREA ================= */}
      <div className="flex flex-1">

        {/* CANVAS AREA */}
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div
            className="relative flex h-full w-full items-center justify-center rounded-xl shadow-lg"
            style={{
              backgroundColor:
                selectedBackground === "transparent"
                  ? "transparent"
                  : selectedBackground === "white"
                    ? "#FFFFFF"
                    : "#000000",
              backgroundImage:
                selectedBackground === "transparent"
                  ? "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)"
                  : "none",
              backgroundSize: selectedBackground === "transparent" ? "20px 20px" : "auto",
              backgroundPosition:
                selectedBackground === "transparent"
                  ? "0 0,0 10px,10px -10px,-10px 0px"
                  : "0 0",
            }}
          >
            {processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
                <Loader2 className="animate-spin size-10 text-blue-600" />
                <span className="ml-3 text-gray-700 text-lg font-medium">Processing...</span>
              </div>
            )}

            {imageUrl && !processing && (
              <img
                src={imageUrl}
                className="max-h-full max-w-full rounded object-contain"
                alt="Processed"
              />
            )}
          </div>

          {/* Upload + Delete */}
          <div className="mt-6 flex items-center gap-3">
            {/* Upload */}
            <label htmlFor="new-upload">
              <div className="flex size-12 cursor-pointer items-center justify-center rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50">
                <svg width="24" height="24" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </label>

            <input
              id="new-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleNewUpload}
            />

            {/* Delete */}
            {imageUrl && (
              <button
                onClick={() => setImageUrl(null)}
                className="flex size-12 items-center justify-center rounded-lg border-2 border-gray-300 hover:border-red-500 hover:bg-red-50"
              >
                <svg width="24" height="24" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="w-80 border-l border-gray-200 bg-white p-8">
          <h3 className="mb-6 text-center text-sm font-semibold text-gray-600">Color</h3>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSelectedBackground("transparent")}
              className={`flex size-20 items-center justify-center rounded-xl border-4 ${
                selectedBackground === "transparent"
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
              style={{
                backgroundImage:
                  "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
                backgroundSize: "10px 10px",
              }}
            />

            <button
              onClick={() => setSelectedBackground("white")}
              className={`size-20 rounded-xl border-4 bg-white ${
                selectedBackground === "white"
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setSelectedBackground("black")}
              className={`size-20 rounded-xl border-4 bg-black ${
                selectedBackground === "black"
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <EditorContent />
    </Suspense>
  );
}
