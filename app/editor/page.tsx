// app/editor/page.tsx — FINAL FIXED
"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";

function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const img = params.get("img");
  const cleanParam = params.get("clean");

  const [watermarkedImage, setWatermarkedImage] = useState(img || null);
  const [cleanImage, setCleanImage] = useState(cleanParam || null);
  const [loadingClean, setLoadingClean] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    const res = await fetch("/api/remove-background", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Processing failed");
      return;
    }

    setWatermarkedImage(data.processed);
    setCleanImage(data.clean);

    router.replace(
      `/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(
        data.clean
      )}`
    );
  };

  const triggerDownload = (url, filename) => {
    const a = document.createElement("a");
    a.href = url + `?fl_attachment=${filename}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    triggerDownload(watermarkedImage, "with-watermark.png");
  };

  const handleDownloadClean = async () => {
    if (!cleanImage) return alert("Clean image not ready");

    if (!session?.user) return router.push("/auth/signup");

    setLoadingClean(true);

    const res = await fetch("/api/credits/consume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 1 }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      if (data.error?.includes("Not enough")) router.push("/pricing");
      else alert(data.error);
      setLoadingClean(false);
      return;
    }

    triggerDownload(cleanImage, "clean-no-background.png");
    setLoadingClean(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">

      {/* Toolbar */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium">
            Background
          </span>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadWatermarked} disabled={!watermarkedImage}>
              <Download className="mr-2 size-4" />
              With watermark
            </Button>

            <Button
              onClick={handleDownloadClean}
              disabled={!cleanImage || loadingClean}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1">
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="relative max-w-4xl w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg flex justify-center items-center">
            {watermarkedImage ? (
              <img src={watermarkedImage} className="max-h-full max-w-full rounded object-contain" />
            ) : (
              <div className="text-gray-400 text-lg">Upload an image to get started</div>
            )}
          </div>

          <div className="mt-8">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex size-16 items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition">
                <svg width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="16" y1="8" x2="16" y2="24" />
                  <line x1="8" y1="16" x2="24" y2="16" />
                </svg>
              </div>
            </label>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading editor…</div>}>
      <EditorContent />
    </Suspense>
  );
}
