"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";

type BgStyle = "none" | "white" | "black";

function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const img = params.get("img");
  const cleanParam = params.get("clean");

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);

  // NEW: background selector state (default: white)
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");

  // Hydrate images when URL params change
  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);
  }, [img, cleanParam]);

  //
  // CANVAS EXPORT: draw image + selected background (no padding)
  //
  async function downloadWithBackground(
    sourceUrl: string,
    filename: string,
    background: BgStyle
  ) {
    try {
      // Load source image
      const image = new Image();
      image.crossOrigin = "anonymous";
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Failed to load image"));
      });
      image.src = sourceUrl;
      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Background
      if (background === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background === "black") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Draw main image over background
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Export to PNG
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (!b) return reject(new Error("Failed to create image blob"));
          resolve(b);
        }, "image/png");
      });

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("DOWNLOAD ERROR:", err);
      alert("Failed to download file.");
    }
  }

  //
  // DOWNLOAD WITH WATERMARK (no credits)
  //
  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    downloadWithBackground(
      watermarkedImage,
      "with-watermark.png",
      bgStyle
    );
  };

  //
  // DOWNLOAD CLEAN + CREDIT CONSUMPTION
  //
  const handleDownloadClean = async () => {
    if (status === "loading") return;

    // Not logged in → signup
    if (!session?.user) {
      return router.push("/auth/signup");
    }

    if (!cleanImage) {
      alert("Clean image is not ready yet.");
      return;
    }

    setLoadingClean(true);

    try {
      // Deduct 1 credit
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      const data = await res.json();

      // Not enough credits → pricing
      if (res.status === 402 || String(data.error).toLowerCase().includes("not enough")) {
        return router.push("/pricing");
      }

      if (!res.ok) {
        console.error("CONSUME ERROR", data);
        return alert(data.error || "Unexpected error consuming credits.");
      }

      // Notify all CreditPills to refresh
      window.dispatchEvent(new CustomEvent("credits-updated"));

      // Download clean image with selected background
      await downloadWithBackground(
        cleanImage,
        "clean-no-background.png",
        bgStyle
      );
    } catch (err) {
      console.error("CLEAN DOWNLOAD ERROR:", err);
      alert("Network error. Try again.");
    } finally {
      setLoadingClean(false);
    }
  };

  // DELETE IMAGE
  const handleDeleteImage = () => {
    setWatermarkedImage(null);
    setCleanImage(null);
    router.replace("/editor");
  };

  // UPLOAD HANDLER
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      alert(data.error || "Processing failed.");
      return;
    }

    setWatermarkedImage(data.processed);
    setCleanImage(data.clean);

    router.replace(
      `/editor?img=${encodeURIComponent(
        data.processed
      )}&clean=${encodeURIComponent(data.clean || "")}`
    );
  }

  // PREVIEW BACKGROUND STYLE (just for the editor canvas)
  const previewBackgroundClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Background
          </span>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadWatermarked}
              disabled={!watermarkedImage}
            >
              <Download className="mr-2 size-4" />
              With watermark
            </Button>

            <Button
              onClick={handleDownloadClean}
              disabled={loadingClean}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor layout */}
      <div className="flex flex-1">
        <div className="flex flex-1 justify-center gap-8 p-8">
          {/* LEFT: image + upload/delete */}
          <div className="flex flex-1 flex-col items-center">
            <div
              className={`relative flex h-full w-full max-w-4xl items-center justify-center rounded-xl shadow-lg transition ${previewBackgroundClass}`}
            >
              {watermarkedImage ? (
                <img
                  src={watermarkedImage}
                  alt="Processed"
                  className="max-h-full max-w-full rounded object-contain"
                />
              ) : (
                <div className="text-gray-400 text-lg">
                  Upload an image to begin
                </div>
              )}
            </div>

            {/* Upload + Delete */}
            <div className="mt-8 flex items-center gap-6">
              {/* Upload (+) */}
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex size-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow-sm text-3xl text-gray-700 hover:bg-gray-50 transition">
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

              {/* Delete (–) */}
              <button
                onClick={handleDeleteImage}
                className="flex size-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow-sm text-3xl text-gray-700 hover:bg-gray-50 transition"
              >
                –
              </button>
            </div>
          </div>

          {/* RIGHT: background options (pulled in close) */}
          <div className="w-24 flex flex-col items-center gap-6 pt-4">
            {/* No Background (transparent) */}
            <button
              onClick={() => setBgStyle("none")}
              className={`h-20 w-20 rounded-xl border-4 shadow-sm transition ${
                bgStyle === "none"
                  ? "border-blue-500 shadow-md"
                  : "border-gray-300"
              } bg-[url('/checkerboard.png')] bg-repeat`}
            />

            {/* White Background */}
            <button
              onClick={() => setBgStyle("white")}
              className={`h-20 w-20 rounded-xl border-4 shadow-sm transition ${
                bgStyle === "white"
                  ? "border-blue-500 shadow-md"
                  : "border-gray-300"
              } bg-white`}
            />

            {/* Black Background */}
            <button
              onClick={() => setBgStyle("black")}
              className={`h-20 w-20 rounded-xl border-4 shadow-sm transition ${
                bgStyle === "black"
                  ? "border-blue-500 shadow-md"
                  : "border-gray-300"
              } bg-black`}
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
