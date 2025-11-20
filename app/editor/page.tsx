"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
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
  const [loadingNewUpload, setLoadingNewUpload] = useState(false);

  const [bgStyle, setBgStyle] = useState<BgStyle>("white");

  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);
  }, [img, cleanParam]);

  /* ----------------------------
     DOWNLOAD ENGINE
  ----------------------------- */
  async function downloadWithBackground(
    sourceUrl: string,
    filename: string,
    background: BgStyle
  ) {
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

      if (background === "white") ctx.fillStyle = "#fff";
      else if (background === "black") ctx.fillStyle = "#000";

      if (background !== "none") {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject("Failed blob")));
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download.");
    }
  }

  /* ----------------------------
     DOWNLOAD BUTTONS
  ----------------------------- */
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
      alert("Network error.");
    }

    setLoadingClean(false);
  };

  /* ----------------------------
     DELETE + NEW UPLOAD
  ----------------------------- */
  const handleDeleteImage = () => {
    setWatermarkedImage(null);
    setCleanImage(null);
    router.replace("/editor");
  };

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingNewUpload(true);

    const form = new FormData();
    form.append("image", file);

    const res = await fetch("/api/remove-background", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      setLoadingNewUpload(false);
      return alert(data.error);
    }

    setWatermarkedImage(data.processed);
    setCleanImage(data.clean);

    router.replace(
      `/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(
        data.clean || ""
      )}`
    );

    setLoadingNewUpload(false);
  }

  /* ----------------------------
     BACKGROUND PREVIEW STYLE
  ----------------------------- */
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
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex justify-between items-center">

          <span className="bg-gray-100 px-4 py-2 rounded-lg">Background</span>

          {/* Toolbar Buttons */}
          <div className="flex gap-3">

            {/* Logged out → show both buttons */}
            {!session?.user && (
              <Button
                variant="outline"
                onClick={handleDownloadWatermarked}
                disabled={!watermarkedImage}
              >
                <Download className="mr-2 size-4" /> With watermark
              </Button>
            )}

            {/* Always show No Watermark */}
            <Button
              onClick={handleDownloadClean}
              disabled={loadingClean}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex justify-center py-6 px-4 md:px-0">

        <div className="w-full max-w-3xl flex flex-col items-center">

          {/* IMAGE PREVIEW */}
          <div
            className={`rounded-xl shadow-lg w-full max-w-full aspect-square flex items-center justify-center p-4 ${previewBackgroundClass}`}
          >
            {loadingNewUpload ? (
              <div className="text-gray-600 flex flex-col items-center">
                <Loader2 className="animate-spin h-8 w-8 mb-2" />
                Processing new image…
              </div>
            ) : watermarkedImage ? (
              <img
                src={watermarkedImage}
                className="rounded max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-lg p-20">
                Upload an image to begin
              </div>
            )}
          </div>

          {/* BACKGROUND BUTTONS */}
          <div className="flex gap-4 mt-6">

            <button
              onClick={() => setBgStyle("none")}
              className={`h-16 w-16 rounded-xl border-4 bg-[url('/checkerboard.png')] bg-repeat transition-all ${
                bgStyle === "none" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setBgStyle("white")}
              className={`h-16 w-16 rounded-xl border-4 bg-white transition-all ${
                bgStyle === "white" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setBgStyle("black")}
              className={`h-16 w-16 rounded-xl border-4 bg-black transition-all ${
                bgStyle === "black" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />
          </div>

          {/* UPLOAD + DELETE BUTTONS */}
          <div className="flex gap-6 mt-8">

            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow text-3xl text-gray-700 hover:bg-gray-50">
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
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow text-3xl text-gray-700 hover:bg-gray-50"
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
