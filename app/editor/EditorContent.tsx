// app/editor/EditorContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";

type BgStyle = "none" | "white" | "black";

const WATERMARK_TEXT = "remove-background.tech"; // ← CHANGE THIS

export default function EditorContent() {
  const router = useRouter();
  const { user } = useUser();

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");
  const [loadingClean, setLoadingClean] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    try {
      setOriginalImage(sessionStorage.getItem("editor-image"));
      setCleanImage(sessionStorage.getItem("editor-clean"));
    } catch {}
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  const displayImage = cleanImage || originalImage;

  async function drawImageToCanvas(
    sourceUrl: string,
    withWatermark: boolean,
    background: BgStyle
  ): Promise<Blob> {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sourceUrl;

    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Image failed to load"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    
    if (background !== "none") {
      ctx.fillStyle = background === "white" ? "#fff" : "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    if (withWatermark) {
      const fontSize = Math.max(canvas.width / 18, 32);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.rotate((-20 * Math.PI) / 180);

      const spacing = fontSize * 4;
      for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
        for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
          ctx.fillText(WATERMARK_TEXT, x, y);
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/png")
    );
  }

  async function downloadImage(
    source: string,
    filename: string,
    watermark: boolean
  ) {
    const blob = await drawImageToCanvas(source, watermark, bgStyle);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handlePreviewDownload = async () => {
    if (!displayImage) return;
    await downloadImage(displayImage, "preview.png", true);
  };

  const handleCleanDownload = async () => {
    if (!user) return router.push("/auth/signup");
    if (!cleanImage) return;

    setLoadingClean(true);
    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.status === 402 || data?.error === "NO_CREDITS") {
        setShowPaywall(true);
        return;
      }

      await downloadImage(cleanImage, "background-removed.png", false);
    } finally {
      setLoadingClean(false);
    }
  };

  const previewBackgroundClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      <div className="sticky top-0 z-20 bg-white border-b px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={handlePreviewDownload}>
          <Download className="mr-2 size-4" /> Preview
        </Button>

        <Button
          onClick={handleCleanDownload}
          disabled={loadingClean || !cleanImage}
          className="bg-blue-600 text-white"
        >
          <Download className="mr-2 size-4" />
          {loadingClean ? "Processing…" : "Download Clean"}
        </Button>
      </div>

      <div className="flex justify-center py-8">
        <div
          className={`relative rounded-xl shadow-lg p-4 ${previewBackgroundClass}`}
        >
          {displayImage && (
            <>
              <img
                src={displayImage}
                alt="Preview"
                className="max-h-[70vh] object-contain"
              />
              {/* Watermark overlay (visual only) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rotate-[-20deg] text-white/40 text-5xl font-bold select-none">
                  {WATERMARK_TEXT}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showPaywall && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl text-center relative">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Unlock clean downloads</h2>
            <Button onClick={() => router.push("/pricing")}>
              View pricing →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
