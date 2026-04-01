"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";
import {
  MAX_GUEST_PREVIEW_DOWNLOADS,
  getGuestPreviewDownloadCount,
  incrementGuestPreviewDownloadCount,
} from "@/app/lib/guestPreviewLimit";

type BgStyle = "none" | "white" | "black";

export default function EditorContent() {
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCleanImage(sessionStorage.getItem("editor-clean"));
  }, []);

  async function drawAndDownload(
    imageUrl: string,
    filename: string,
    background: BgStyle,
    withWatermark = false
  ) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;

    if (background === "white") ctx.fillStyle = "#fff";
    if (background === "black") ctx.fillStyle = "#000";
    if (background !== "none") ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0);

    if (withWatermark) {
      const watermarkText = "remove-background.tech";
      const fontSize = Math.max(20, Math.round(canvas.width / 24));
      ctx.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = Math.max(2, Math.round(fontSize / 14));
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(watermarkText, canvas.width / 2, canvas.height / 2);
      ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
    }

    const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handlePreviewDownload = async () => {
    if (!cleanImage || loading) return;

    if (!user) {
      const count = getGuestPreviewDownloadCount();
      if (count >= MAX_GUEST_PREVIEW_DOWNLOADS) {
        router.push("/pricing");
        return;
      }
      incrementGuestPreviewDownloadCount();
    }

    setLoading(true);
    try {
      await drawAndDownload(cleanImage, "background-removed-preview.png", bgStyle, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanDownload = async () => {
    if (!user) {
      router.push("/auth/signup");
      return;
    }

    if (!cleanImage || loading) return;

    setLoading(true);

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

      await drawAndDownload(cleanImage, "background-removed.png", bgStyle);
      window.dispatchEvent(new Event("credits-updated"));
      window.dispatchEvent(new Event("auth-changed"));
    } finally {
      setLoading(false);
    }
  };

  const previewBgClass =
    bgStyle === "white" ? "bg-white" : bgStyle === "black" ? "bg-black" : "bg-transparent";

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-end gap-3">
        <Button onClick={handlePreviewDownload} disabled={loading} variant="outline">
          <Download className="mr-2 size-4" />
          {loading ? "Processing…" : "Download Preview"}
        </Button>
        <Button onClick={handleCleanDownload} disabled={loading} className="bg-blue-600 text-white">
          <Download className="mr-2 size-4" />
          {loading ? "Processing…" : "Download Clean"}
        </Button>
      </div>

      <div className="flex justify-center px-6 py-8">
        <div className="flex gap-4 max-w-5xl w-full">
          <div>
            <div className={`rounded-xl shadow-lg p-4 border ${previewBgClass}`}>
              {cleanImage && <img src={cleanImage} className="max-h-[65vh] object-contain" alt="Edited image" />}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 h-16 w-16 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer bg-white"
            >
              <Plus />
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept="image/*"
                onChange={() => router.push("/")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button onClick={() => setBgStyle("none")} className="h-14 w-14 border bg-[url('/checkerboard.png')] bg-cover" />
            <button onClick={() => setBgStyle("white")} className="h-14 w-14 bg-white border" />
            <button onClick={() => setBgStyle("black")} className="h-14 w-14 bg-black border" />
          </div>
        </div>
      </div>
    </div>
  );
}
