// app/editor/EditorContent.tsx
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

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    try {
      const wm = sessionStorage.getItem("editor-image"); // original
      const cl = sessionStorage.getItem("editor-clean"); // background-removed
      setWatermarkedImage(wm || null);
      setCleanImage(cl || null);
    } catch {
      setWatermarkedImage(null);
      setCleanImage(null);
    }

    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  async function downloadWithBackground(
    sourceUrl: string,
    filename: string,
    background: BgStyle
  ) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = sourceUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image failed to load"));
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
  }

  const handleDownloadPreview = async () => {
    const preview = cleanImage || watermarkedImage;
    if (!preview) return;

    try {
      await downloadWithBackground(
        preview,
        "background-removed-preview.png",
        bgStyle
      );
    } catch {
      alert("Download failed — please try again.");
    }
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

      window.dispatchEvent(new Event("credits-updated"));
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

  const handleClear = () => {
    try {
      sessionStorage.removeItem("editor-image");
      sessionStorage.removeItem("editor-clean");
    } catch {}
    setWatermarkedImage(null);
    setCleanImage(null);
    router.push("/");
  };

  const previewBackgroundClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  const displayImage = cleanImage || watermarkedImage;

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F6]">
      <div className="border-b bg-white shadow-sm sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <span className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700">
            Background Preview
          </span>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadPreview}
              disabled={!displayImage}
            >
              <Download className="mr-2 size-4" /> Preview
            </Button>

            <Button
              onClick={handleDownloadClean}
              disabled={loadingClean || !cleanImage}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "Download Clean"}
            </Button>

            <Button variant="outline" onClick={handleClear}>
              Start over
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4 py-6 pt-4">
        <div className="flex gap-8 w-full max-w-6xl">
          <div className="flex flex-col flex-1 items-center">
            <div
              className={`rounded-xl shadow-lg w-full max-h-[70vh] flex items-center justify-center p-4 ${previewBackgroundClass}`}
            >
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Preview"
                  className="object-contain max-w-full max-h-full"
                />
              ) : (
                <div className="text-gray-400 text-lg">
                  No image loaded. Click “Start over”.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-4">
            <button
              onClick={() => setBgStyle("none")}
              className={`h-20 w-20 rounded-xl border-4 bg-[url('/checkerboard.png')] bg-repeat ${
                bgStyle === "none"
                  ? "border-blue-500 shadow-xl"
                  : "border-gray-300"
              }`}
            />
            <button
              onClick={() => setBgStyle("white")}
              className={`h-20 w-20 rounded-xl border-4 bg-white ${
                bgStyle === "white"
                  ? "border-blue-500 shadow-xl"
                  : "border-gray-300"
              }`}
            />
            <button
              onClick={() => setBgStyle("black")}
              className={`h-20 w-20 rounded-xl border-4 bg-black ${
                bgStyle === "black"
                  ? "border-blue-500 shadow-xl"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>
      </div>

      {showPaywall && watermarkedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative max-w-md w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              onClick={() => setShowPaywall(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="size-6" />
            </button>

            <div className="p-8 text-center">
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                Your image is ready!
              </h2>
              <p className="mb-7 text-gray-600">Unlock clean downloads</p>

              <Button
                size="lg"
                className="w-full bg-blue-600 py-6 text-lg font-semibold text-white hover:bg-blue-700"
                onClick={() => router.push("/pricing?from=paywall")}
              >
                View pricing →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
