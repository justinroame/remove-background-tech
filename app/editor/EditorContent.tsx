"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";

type BgStyle = "none" | "white" | "black";

export default function EditorContent() {
  const router = useRouter();
  const { user } = useUser();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    try {
      setPreviewImage(sessionStorage.getItem("editor-image"));
      setCleanImage(sessionStorage.getItem("editor-clean"));
    } catch {}
    window.scrollTo({ top: 0 });
  }, []);

  async function drawAndDownload(
    imageUrl: string,
    filename: string,
    background: BgStyle,
    withWatermark: boolean
  ) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej();
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d")!;
    if (background === "white") ctx.fillStyle = "#ffffff";
    if (background === "black") ctx.fillStyle = "#000000";
    if (background !== "none") ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0);

    if (withWatermark) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#000000";
      ctx.font = `${Math.floor(canvas.width / 12)}px sans-serif`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "center";
      ctx.fillText("remove-background.tech", 0, 0);
      ctx.restore();
    }

    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/png")
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handlePreview = async () => {
    if (!previewImage) return;
    await drawAndDownload(
      previewImage,
      "preview-watermarked.png",
      bgStyle,
      true
    );
  };

  const handleClean = async () => {
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
      if (!res.ok) {
        if (res.status === 402) setShowPaywall(true);
        return;
      }

      await drawAndDownload(
        cleanImage,
        "background-removed.png",
        bgStyle,
        false
      );
    } finally {
      setLoadingClean(false);
    }
  };

  const previewBgClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      {/* TOP BAR */}
      <div className="sticky top-0 z-20 bg-white border-b px-6 py-4 flex justify-end gap-3">
        <Button variant="outline" onClick={handlePreview}>
          <Download className="mr-2 size-4" /> Preview
        </Button>

        <Button
          onClick={handleClean}
          disabled={loadingClean || !cleanImage}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Download className="mr-2 size-4" />
          {loadingClean ? "Processing…" : "Download Clean"}
        </Button>
      </div>

      {/* MAIN */}
      <div className="flex justify-center px-6 py-8">
        <div className="flex gap-10 max-w-6xl w-full">
          {/* IMAGE */}
          <div className="flex-1 flex justify-center">
            <div
              className={`rounded-xl shadow-lg p-4 max-h-[70vh] ${previewBgClass}`}
            >
              {previewImage && (
                <div className="relative">
                  <img
                    src={previewImage}
                    className="max-h-[65vh] object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="rotate-[-45deg] text-black/40 text-6xl font-semibold">
                      remove-background.tech
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BACKGROUND OPTIONS */}
          <div className="flex flex-col gap-4 pt-4">
            <button
              onClick={() => setBgStyle("none")}
              className={`h-20 w-20 rounded-xl border-4 bg-[url('/checkerboard.png')] ${
                bgStyle === "none" ? "border-blue-500" : "border-gray-300"
              }`}
            />
            <button
              onClick={() => setBgStyle("white")}
              className={`h-20 w-20 rounded-xl border-4 bg-white ${
                bgStyle === "white" ? "border-blue-500" : "border-gray-300"
              }`}
            />
            <button
              onClick={() => setBgStyle("black")}
              className={`h-20 w-20 rounded-xl border-4 bg-black ${
                bgStyle === "black" ? "border-blue-500" : "border-gray-300"
              }`}
            />
          </div>
        </div>
      </div>

      {/* PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-xl p-8 relative">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Unlock clean downloads</h2>
            <Button onClick={() => router.push("/pricing")}>
              View Pricing →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
