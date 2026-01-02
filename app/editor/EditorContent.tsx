"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";
import {
  getGuestPreviewDownloadCount,
  incrementGuestPreviewDownloadCount,
  MAX_GUEST_PREVIEW_DOWNLOADS,
} from "@/app/lib/guestPreviewLimit";

type BgStyle = "none" | "white" | "black";

export default function EditorContent() {
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    setCleanImage(sessionStorage.getItem("editor-clean"));
    window.scrollTo({ top: 0 });
  }, []);

  /* ---------------- CANVAS DRAW ---------------- */

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
      img.onerror = () => rej(new Error("Image failed to load"));
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
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);

      const fontSize = Math.floor(canvas.width / 8);
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.lineWidth = Math.max(8, fontSize / 10);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeText("remove-background.tech", 0, 0);

      ctx.fillStyle = "#000000";
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

  /* ---------------- PREVIEW (GUEST OK) ---------------- */

  const handlePreview = async () => {
    if (!cleanImage) return;

    if (!user) {
      const count = getGuestPreviewDownloadCount();
      if (count >= MAX_GUEST_PREVIEW_DOWNLOADS) {
        setShowPaywall(true);
        return;
      }
      incrementGuestPreviewDownloadCount();
    }

    await drawAndDownload(
      cleanImage,
      "preview-watermarked.png",
      bgStyle,
      true
    );
  };

  /* ---------------- CLEAN DOWNLOAD (SERVER IS BOSS) ---------------- */

  const handleClean = async () => {
    if (!user) {
      router.push("/auth/signup");
      return;
    }

    if (!cleanImage) return;

    setLoadingClean(true);

    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      if (res.status === 402) {
        router.push("/pricing");
        return;
      }

      if (!res.ok) {
        alert("Unable to process credits.");
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

  /* ---------------- UPLOAD NEW IMAGE ---------------- */

  const handleFileChange = (file?: File) => {
    if (!file) return;
    sessionStorage.clear();
    sessionStorage.setItem("editor-image", URL.createObjectURL(file));
    router.push("/");
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
        <div className="relative max-w-5xl w-full flex gap-4">
          {/* IMAGE */}
          <div className="relative">
            <div
              className={`relative rounded-xl shadow-lg p-4 max-h-[70vh] ${previewBgClass}`}
            >
              {cleanImage && (
                <>
                  <img
                    src={cleanImage}
                    className="max-h-[65vh] object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="rotate-[-45deg] text-black text-6xl font-extrabold drop-shadow-[0_0_3px_white]">
                      remove-background.tech
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ➕ Upload box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 h-16 w-16 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 bg-white"
            >
              <Plus className="size-6 text-gray-500" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0])
                }
              />
            </div>
          </div>

          {/* BACKGROUND OPTIONS */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setBgStyle("none")}
              className={`h-14 w-14 rounded-lg border-4 bg-[url('/checkerboard.png')] ${
                bgStyle === "none" ? "border-blue-500" : "border-gray-300"
              }`}
            />
            <button
              onClick={() => setBgStyle("white")}
              className={`h-14 w-14 rounded-lg border-4 bg-white ${
                bgStyle === "white" ? "border-blue-500" : "border-gray-300"
              }`}
            />
            <button
              onClick={() => setBgStyle("black")}
              className={`h-14 w-14 rounded-lg border-4 bg-black ${
                bgStyle === "black" ? "border-blue-500" : "border-gray-300"
              }`}
            />
          </div>
        </div>
      </div>

      {/* PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative max-w-md w-full rounded-2xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              ⚠ Limited-Time Offer
            </h2>
            <p className="mb-6">
              Get <strong>20 credits for $2.99</strong> — today only.
            </p>
            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => router.push("/pricing?deal=guest-299")}
            >
              Unlock 20 Credits →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
