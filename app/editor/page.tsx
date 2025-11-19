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

  const [bgStyle, setBgStyle] = useState<BgStyle>("white");

  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);
  }, [img, cleanParam]);

  async function downloadWithBackground(
    sourceUrl: string,
    filename: string,
    background: BgStyle
  ) {
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Failed to load image"));
      });
      image.src = sourceUrl;

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      if (background === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background === "black") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/png");
      });

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("DOWNLOAD ERROR:", err);
    }
  }

  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    downloadWithBackground(watermarkedImage, "with-watermark.png", bgStyle);
  };

  const handleDownloadClean = async () => {
    if (status === "loading") return;
    if (!session?.user) return router.push("/auth/signup");
    if (!cleanImage) return alert("Clean image not ready.");

    setLoadingClean(true);

    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      const data = await res.json();

      if (res.status === 402 || String(data.error).toLowerCase().includes("not enough")) {
        return router.push("/pricing");
      }

      if (!res.ok) return alert("Credit error.");

      window.dispatchEvent(new CustomEvent("credits-updated"));

      await downloadWithBackground(cleanImage, "clean-no-background.png", bgStyle);
    } catch (err) {
      console.error("CLEAN DOWNLOAD ERROR:", err);
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

    const form = new FormData();
    form.append("image", file);

    const res = await fetch("/api/remove-background", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (!res.ok) return alert("Processing error.");

    setWatermarkedImage(data.processed);
    setCleanImage(data.clean);

    router.replace(
      `/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(
        data.clean
      )}`
    );
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
        <div className="mx-auto flex max-w-7xl justify-between px-6 py-4">
          <span className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700">
            Background
          </span>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadWatermarked}
              disabled={!watermarkedImage}
            >
              <Download className="mr-2 size-4" /> With watermark
            </Button>

            <Button
              onClick={handleDownloadClean}
              disabled={loadingClean}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="mr-2 size-4" />{" "}
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 justify-center p-10">

        {/* RELATIVE WRAPPER FOR IMAGE + BACKGROUND SELECTOR */}
        <div className="relative flex">

          {/* IMAGE */}
          <div
            className={`flex items-center justify-center rounded-xl shadow-lg ${previewBackgroundClass}`}
            style={{ width: "900px", height: "900px" }}
          >
            {watermarkedImage ? (
              <img
                src={watermarkedImage}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-lg">Upload an image…</div>
            )}
          </div>

          {/* BACKGROUND SELECTOR — FIXED TIGHT NEXT TO IMAGE */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[910px] flex flex-col gap-4">

            {/* Transparent */}
            <button
              onClick={() => setBgStyle("none")}
              className={`
                h-20 w-20 rounded-xl border-4 transition-all
                hover:scale-110 hover:shadow-xl
                ${bgStyle === "none" ? "border-blue-500 shadow-xl" : "border-gray-300"}
                bg-[url('/checkerboard.png')] bg-repeat
              `}
            />

            {/* White */}
            <button
              onClick={() => setBgStyle("white")}
              className={`
                h-20 w-20 rounded-xl border-4 transition-all
                hover:scale-110 hover:shadow-xl
                ${bgStyle === "white" ? "border-blue-500 shadow-xl" : "border-gray-300"}
                bg-white
              `}
            />

            {/* Black */}
            <button
              onClick={() => setBgStyle("black")}
              className={`
                h-20 w-20 rounded-xl border-4 transition-all
                hover:scale-110 hover:shadow-xl
                ${bgStyle === "black" ? "border-blue-500 shadow-xl" : "border-gray-300"}
                bg-black
              `}
            />
          </div>
        </div>
      </div>

      {/* Upload/Delete */}
      <div className="flex justify-center gap-6 pb-10">
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex size-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow text-3xl text-gray-700 hover:bg-gray-50">
            +
          </div>
        </label>
        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        <button
          onClick={handleDeleteImage}
          className="flex size-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow text-3xl text-gray-700 hover:bg-gray-50"
        >
          –
        </button>
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
