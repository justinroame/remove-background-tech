"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";

// ✅ Your file is now here:
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
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");

  const [showPaywall, setShowPaywall] = useState(false);
  const [loadingClean, setLoadingClean] = useState(false);
  const [loadingNew, setLoadingNew] = useState(false);

  useEffect(() => {
    try {
      setCleanImage(sessionStorage.getItem("editor-clean"));
    } catch {
      setCleanImage(null);
    }
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
      img.onerror = () => rej(new Error("Image failed to load"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // Background fill
    if (background === "white") ctx.fillStyle = "#ffffff";
    if (background === "black") ctx.fillStyle = "#000000";
    if (background !== "none") ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0);

    // WATERMARK (solid black + white outline)
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

  // ✅ Guest preview: watermarked, limited to 3 downloads
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

    await drawAndDownload(cleanImage, "preview-watermarked.png", bgStyle, true);
  };

  // ✅ Clean download: SERVER enforced credits (consume route must return 402)
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

      const data = await res.json().catch(() => ({}));

      // ✅ If no credits, redirect immediately
      if (res.status === 402 || data?.error === "NO_CREDITS") {
        router.push("/pricing");
        return;
      }

      if (!res.ok) {
        alert(data?.error || "Unable to process credits.");
        return;
      }

      window.dispatchEvent(new Event("credits-updated"));
      await drawAndDownload(cleanImage, "background-removed.png", bgStyle, false);
    } finally {
      setLoadingClean(false);
    }
  };

  // ✅ Upload another image IN the editor (no redirect)
  const uploadNewImage = async (file?: File) => {
    if (!file) return;

    setLoadingNew(true);
    try {
      // clear stale
      sessionStorage.removeItem("editor-image");
      sessionStorage.removeItem("editor-clean");

      const form = new FormData();
      form.append("image", file);

      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.clean) {
        throw new Error(data?.error || "Background removal failed");
      }

      sessionStorage.setItem("editor-clean", data.clean);
      setCleanImage(data.clean);
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setLoadingNew(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <Button variant="outline" onClick={handlePreview} disabled={!cleanImage}>
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
        <div className="max-w-5xl w-full flex gap-4 items-start">
          {/* IMAGE COLUMN */}
          <div className="flex flex-col items-start">
            <div
              className={`relative rounded-xl shadow-lg p-4 max-h-[70vh] ${previewBgClass}`}
            >
              {cleanImage ? (
                <>
                  <img
                    src={cleanImage}
                    className="max-h-[65vh] object-contain"
                    alt="Preview"
                  />
                  {/* watermark overlay for ON-SCREEN preview */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="rotate-[-45deg] text-black text-6xl font-extrabold drop-shadow-[0_0_3px_white]">
                      remove-background.tech
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">No image loaded</div>
              )}
            </div>

            {/* + Upload box under image */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 h-16 w-16 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 bg-white"
              title="Upload another image"
            >
              {loadingNew ? (
                <Loader2 className="size-6 animate-spin text-gray-500" />
              ) : (
                <Plus className="size-6 text-gray-500" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => uploadNewImage(e.target.files?.[0])}
              />
            </div>
          </div>

          {/* BACKGROUND OPTIONS (right side, close to top) */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setBgStyle("none")}
              className={`h-14 w-14 rounded-lg border-4 bg-[url('/checkerboard.png')] bg-repeat ${
                bgStyle === "none" ? "border-blue-500" : "border-gray-300"
              }`}
              aria-label="Transparent background"
            />
            <button
              onClick={() => setBgStyle("white")}
              className={`h-14 w-14 rounded-lg border-4 bg-white ${
                bgStyle === "white" ? "border-blue-500" : "border-gray-300"
              }`}
              aria-label="White background"
            />
            <button
              onClick={() => setBgStyle("black")}
              className={`h-14 w-14 rounded-lg border-4 bg-black ${
                bgStyle === "black" ? "border-blue-500" : "border-gray-300"
              }`}
              aria-label="Black background"
            />
          </div>
        </div>
      </div>

      {/* GUEST DEAL MODAL */}
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
