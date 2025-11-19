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

  async function downloadWithBackground(sourceUrl: string, filename: string, background: BgStyle) {
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";

      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Image failed to load"));
      });

      image.src = sourceUrl;
      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      if (background === "white") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (background === "black") {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (!b) return reject("Failed blob");
          resolve(b);
        });
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download");
    }
  }

  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    downloadWithBackground(watermarkedImage, "with-watermark.png", bgStyle);
  };

  const handleDownloadClean = async () => {
    if (status === "loading") return;
    if (!session?.user) return router.push("/auth/signup");
    if (!cleanImage) return alert("Clean image not ready");

    setLoadingClean(true);

    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      const data = await res.json();

      if (res.status === 402 || String(data.error).includes("not enough")) {
        return router.push("/pricing");
      }

      if (!res.ok) return alert(data.error);

      window.dispatchEvent(new CustomEvent("credits-updated"));

      await downloadWithBackground(cleanImage, "clean-no-background.png", bgStyle);
    } catch {
      alert("Network error");
    }

    setLoadingClean(false);
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

    const res = await fetch("/api/remove-background", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) return alert(data.error);

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
    <div className="flex flex-col min-h-screen bg-[#F4F5F6]">

      {/* Toolbar */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <span className="bg-gray-100 px-4 py-2 rounded-lg">Background</span>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownloadWatermarked} disabled={!watermarkedImage}>
              <Download className="mr-2 size-4" /> With watermark
            </Button>

            <Button onClick={handleDownloadClean} disabled={loadingClean} className="bg-blue-600 text-white hover:bg-blue-700">
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex justify-center py-8">

        {/* CANVAS WRAPPER — THIS IS THE KEY FIX */}
        <div className="relative">

          {/* Background buttons absolutely positioned */}
          <div className="absolute right-[-90px] top-0 flex flex-col gap-4">

            {/* Transparent */}
            <button
              onClick={() => setBgStyle("none")}
              className={`
                h-20 w-20 rounded-xl border-4 bg-[url('/checkerboard.png')] bg-repeat
                transition-all hover:scale-110 hover:shadow-xl
                ${bgStyle === "none" ? "border-blue-500 shadow-xl" : "border-gray-300"}
              `}
            />

            {/* White */}
            <button
              onClick={() => setBgStyle("white")}
              className={`
                h-20 w-20 rounded-xl border-4 bg-white
                transition-all hover:scale-110 hover:shadow-xl
                ${bgStyle === "white" ? "border-blue-500 shadow-xl" : "border-gray-300"}
              `}
            />

            {/* Black */}
            <button
              onClick={() => setBgStyle("black")}
              className={`
                h-20 w-20 rounded-xl border-4 bg-black
                transition-all hover:scale-110 hover:shadow-xl
                ${bgStyle === "black" ? "border-blue-500 shadow-xl" : "border-gray-300"}
              `}
            />

          </div>

          {/* IMAGE CANVAS */}
          <div className={`rounded-xl shadow-lg p-0 ${previewBackgroundClass}`}>
            {watermarkedImage ? (
              <img src={watermarkedImage} className="rounded max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-gray-400 text-lg p-20">Upload an image to begin</div>
            )}
          </div>

          {/* Upload / Delete */}
          <div className="flex gap-6 mt-8 justify-center">
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
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="text-center p-20">Loading editor…</div>}>
      <EditorContent />
    </Suspense>
  );
}
