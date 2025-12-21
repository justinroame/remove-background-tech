"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getGuestUploadCount,
  incrementGuestUpload,
  MAX_GUEST_UPLOADS,
} from "@/lib/guestLimit";
import { useUser } from "@/lib/useUser";

type BgStyle = "none" | "white" | "black";

export default function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useUser(); // ✅ replaces next-auth

  const img = params.get("img");
  const cleanParam = params.get("clean");

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);
  const [loadingNewUpload, setLoadingNewUpload] = useState(false);
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, [img, cleanParam]);

  async function downloadWithBackground(
    sourceUrl: string,
    filename: string,
    background: BgStyle,
  ) {
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = sourceUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject();
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      if (background === "white") ctx.fillStyle = "#ffffff";
      else if (background === "black") ctx.fillStyle = "#000000";

      if (background !== "none") {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b as Blob), "image/png")
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed — please try again.");
    }
  }

  const handleDownloadWatermarked = async () => {
    if (!watermarkedImage) return;
    await downloadWithBackground(
      watermarkedImage,
      "background-removed-preview.png",
      bgStyle
    );
  };

  const handleDownloadClean = async () => {
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

      if (!res.ok) {
        alert(data?.error || "Something went wrong.");
        return;
      }

      await downloadWithBackground(
        cleanImage,
        "background-removed.png",
        bgStyle
      );
    } catch {
      alert("Network error.");
    } finally {
      setLoadingClean(false);
    }
  };

  const handleDeleteImage = () => {
    setWatermarkedImage(null);
    setCleanImage(null);
    router.replace("/editor");
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      const count = getGuestUploadCount();
      if (count >= MAX_GUEST_UPLOADS) return router.push("/auth/signup");
      incrementGuestUpload();
    }

    setLoadingNewUpload(true);
    const form = new FormData();
    form.append("image", file);

    const res = await fetch("/api/remove-background", {
      method: "POST",
      body: form,
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Processing failed");
      setLoadingNewUpload(false);
      return;
    }

    setWatermarkedImage(data.processed);
    setCleanImage(data.clean);
    router.replace(
      `/editor?img=${encodeURIComponent(
        data.processed
      )}&clean=${encodeURIComponent(data.clean)}`
    );
    setLoadingNewUpload(false);
  }

  const previewBackgroundClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F6]">
      {/* UI BELOW IS 100% UNCHANGED */}
      {/* …everything else exactly the same… */}
    </div>
  );
}
