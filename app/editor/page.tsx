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

  // Default background selection
  const [bgStyle, setBgStyle] = useState<BgStyle>("white");

  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);
  }, [img, cleanParam]);


  // CANVAS EXPORT WITH SELECTED BACKGROUND
  async function downloadWithBackground(sourceUrl: string, filename: string, background: BgStyle) {
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = sourceUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject("Image load failed");
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");

      // Apply background
      if (background === "white") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background === "black") {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Draw the main image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject("Blob fail")), "image/png")
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed.");
    }
  }

  // DOWNLOADS
  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    downloadWithBackground(watermarkedImage, "with-watermark.png", bgStyle);
  };

  const handleDownloadClean = async () => {
    if (!session?.user) return router.push("/auth/signup");
    if (!cleanImage) return alert("Clean version not ready.");

    setLoadingClean(true);
    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 })
      });

      const data = await res.json();

      if (res.status === 402) return router.push("/pricing");
      if (!res.ok) return alert(data.error);

      window.dispatchEvent(new CustomEvent("credits-updated"));

      await downloadWithBackground(cleanImage, "clean-no-background.png", bgStyle);
    } finally {
      setLoadingClean(false);
    }
  };

  // Delete image
  const handleDeleteImage = () => {
    setWatermarkedImage(null);
    setCleanImage(null);
    router.replace("/editor");
  };

  // Upload handler
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    const res = await fetch("/api/remove-background", {
      method: "POST",
      body: form
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Processing failed.");
      return;
    }

    setWatermarkedImage(data.processed);
    setCleanImage(data.clean);

    router.replace(`/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(data.clean || "")}`);
  }

  const previewBackgroundClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">

      {/* Toolbar */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
            Background
          </span>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadWatermarked} disabled={!watermarkedImage}>
              <Download className="mr-2 h-4 w-4" /> With watermark
            </Button>

            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleDownloadClean}>
              <Download className="mr-2 h-4 w-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>

        </div>
      </div>

      {/* Working Area */}
      <div className="flex flex-1 px-8 py-6 relative">

        {/* Image + Upload/Delete buttons */}
        <div className="flex flex-1 flex-col items-center">

          <div className={`relative flex h-full w-full max-w-4xl items-center justify-center rounded-xl shadow-lg ${previewBackgroundClass}`}>
            {watermarkedImage ? (
              <img src={watermarkedImage} className="max-h-full max-w-full object-contain rounded" />
            ) : (
              <div className="text-gray-400 text-lg">Upload an image to begin</div>
            )}
          </div>

          {/* Upload + delete */}
          <div className="mt-8 flex items-center gap-6">

            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-white text-3xl text-gray-700 shadow hover:bg-gray-50">
                +
              </div>
            </label>

            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />

            <button onClick={handleDeleteImage} className="flex h-16 w-16 items-center justify-center rounded-xl border bg-white text-3xl text-gray-700 shadow hover:bg-gray-50">
              –
            </button>

          </div>
        </div>

        {/* Background selector - TOP RIGHT OF IMAGE */}
        <div className="absolute top-4 right-[50px] flex flex-col gap-4 select-none">

          {/* Transparent */}
          <button
            onClick={() => setBgStyle("none")}
            className={`
              h-20 w-20 rounded-xl border-4 bg-[url('/checkerboard.png')] bg-repeat transition-all hover:scale-110 hover:shadow-lg
              ${bgStyle === "none" ? "border-blue-500 shadow-xl" : "border-gray-300"}
            `}
          />

          {/* White */}
          <button
            onClick={() => setBgStyle("white")}
            className={`
              h-20 w-20 rounded-xl border-4 bg-white transition-all hover:scale-110 hover:shadow-lg
              ${bgStyle === "white" ? "border-blue-500 shadow-xl" : "border-gray-300"}
            `}
          />

          {/* Black */}
          <button
            onClick={() => setBgStyle("black")}
            className={`
              h-20 w-20 rounded-xl border-4 bg-black transition-all hover:scale-110 hover:shadow-lg
              ${bgStyle === "black" ? "border-blue-500 shadow-xl" : "border-gray-300"}
            `}
          />

        </div>

      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <EditorContent />
    </Suspense>
  );
}
