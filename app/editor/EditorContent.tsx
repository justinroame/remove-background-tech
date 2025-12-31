"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/useUser";
import {
  getGuestUploadCount,
  incrementGuestUpload,
  MAX_GUEST_UPLOADS,
} from "@/lib/guestLimit";

type BgStyle = "none" | "white" | "black";

export default function EditorContent() {
  const router = useRouter();
  const { user } = useUser();

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);
  const [loadingNewUpload, setLoadingNewUpload] = useState(false);
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");
  const [showPaywall, setShowPaywall] = useState(false);

  // ✅ LOAD IMAGE FROM SESSION STORAGE (NOT URL)
  useEffect(() => {
    const img = sessionStorage.getItem("editor-image");
    const clean = sessionStorage.getItem("editor-clean");

    if (img) setWatermarkedImage(img);
    if (clean) setCleanImage(clean);

    window.scrollTo({ top: 0 });
  }, []);

  async function downloadWithBackground(
    sourceUrl: string,
    filename: string,
    background: BgStyle
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

  const handleDownloadClean = async () => {
    if (!user) return router.push("/auth/signup");
    if (!cleanImage) return;

    setLoadingClean(true);
    try {
      const res = await fetch("/api/credits/consume", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 402 || data?.error === "NO_CREDITS") {
        setShowPaywall(true);
        return;
      }

      if (!res.ok) {
        alert(data?.error || "Something went wrong.");
        return;
      }

      window.dispatchEvent(new Event("credits-updated"));
      await downloadWithBackground(cleanImage, "background-removed.png", bgStyle);
    } catch {
      alert("Network error.");
    } finally {
      setLoadingClean(false);
    }
  };

  const handleDeleteImage = () => {
    sessionStorage.removeItem("editor-image");
    sessionStorage.removeItem("editor-clean");
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

    if (!res.ok || !data?.processed) {
      alert(data?.error || "Processing failed");
      setLoadingNewUpload(false);
      return;
    }

    sessionStorage.setItem("editor-image", data.processed);
    sessionStorage.setItem("editor-clean", data.clean);

    setWatermarkedImage(data.processed);
    setCleanImage(data.clean);

    router.replace("/editor");
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
      {/* Toolbar */}
      <div className="border-b bg-white shadow-sm sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <span className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700">
            Background Preview
          </span>
          <Button
            onClick={handleDownloadClean}
            disabled={loadingClean || !cleanImage}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Download className="mr-2 size-4" />
            {loadingClean ? "Processing…" : "Download Clean Image"}
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex justify-center px-4 py-6">
        <div className="flex gap-8 w-full max-w-6xl">
          <div className="flex flex-col flex-1 items-center">
            <div
              className={`rounded-xl shadow-lg w-full max-h-[70vh] flex items-center justify-center p-4 ${previewBackgroundClass}`}
            >
              {loadingNewUpload ? (
                <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
              ) : watermarkedImage ? (
                <img
                  src={watermarkedImage}
                  alt="Preview"
                  className="object-contain max-w-full max-h-full"
                />
              ) : (
                <div className="text-gray-400 text-lg">
                  Upload an image to start
                </div>
              )}
            </div>

            <div className="flex gap-6 mt-6">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-white border shadow text-3xl">
                  +
                </div>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                onClick={handleDeleteImage}
                className="h-16 w-16 flex items-center justify-center rounded-xl bg-white border shadow text-3xl"
              >
                –
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-4">
            <button onClick={() => setBgStyle("none")} className={`h-20 w-20 rounded-xl border-4 bg-[url('/checkerboard.png')] ${bgStyle === "none" ? "border-blue-500" : "border-gray-300"}`} />
            <button onClick={() => setBgStyle("white")} className={`h-20 w-20 rounded-xl border-4 bg-white ${bgStyle === "white" ? "border-blue-500" : "border-gray-300"}`} />
            <button onClick={() => setBgStyle("black")} className={`h-20 w-20 rounded-xl border-4 bg-black ${bgStyle === "black" ? "border-blue-500" : "border-gray-300"}`} />
          </div>
        </div>
      </div>

      {/* Paywall */}
      {showPaywall && watermarkedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>
            <h2 className="text-2xl font-bold mb-3">
              Your image is ready!
            </h2>
            <p className="mb-6 text-gray-600">
              Remove the watermark and download the clean version
            </p>
            <Button
              className="w-full bg-blue-600 py-6 text-lg"
              onClick={() => router.push("/pricing?from=paywall")}
            >
              Unlock now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
