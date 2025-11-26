"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

type BgStyle = "none" | "white" | "black";

export default function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const img = params.get("img");
  const cleanParam = params.get("clean");

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);

  const [loadingClean, setLoadingClean] = useState(false);
  const [loadingNewUpload, setLoadingNewUpload] = useState(false);

  const [bgStyle, setBgStyle] = useState<BgStyle>("white");

  // SEO: add invisible H1 for clarity
  const invisibleH1 = (
    <h1 className="sr-only">
      Online Background Removal Editor – Remove Background from Image Using AI
    </h1>
  );

  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);
  }, [img, cleanParam]);

  /* ----------------------------------
        DOWNLOAD ENGINE
  ----------------------------------- */
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
        image.onerror = () => reject("Load failed");
      });

      image.src = sourceUrl;

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      if (background === "white") ctx.fillStyle = "#ffffff";
      else if (background === "black") ctx.fillStyle = "#000000";

      if (background !== "none") ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject("Blob failed")));
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

  /* ----------------------------------
        DOWNLOAD BUTTONS
  ----------------------------------- */
  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    downloadWithBackground(watermarkedImage, "background-removed-preview.png", bgStyle);
  };

  const handleDownloadClean = async () => {
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

      if (res.status === 402 || data.error?.includes("not enough")) {
        return router.push("/pricing");
      }

      await downloadWithBackground(cleanImage, "background-removed.png", bgStyle);
    } catch {
      alert("Network error.");
    }

    setLoadingClean(false);
  };

  /* ----------------------------------
        DELETE / NEW UPLOAD
  ----------------------------------- */
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

  /* ----------------------------------
        PREVIEW BACKGROUND
  ----------------------------------- */
  const previewBackgroundClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  /* ----------------------------------
            RENDER
  ----------------------------------- */
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F6]">

      {invisibleH1}

      {/* FAQ Schema for SEO richness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Can I preview background removal online?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the online editor allows you to preview background removal instantly using AI and switch between white, black, or transparent backgrounds."
                }
              }
            ]
          })
        }}
      />

      {/* Toolbar */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">

          <span className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700">
            Background Preview
          </span>

          <p className="text-xs text-gray-500">
            AI background remover · Transparent / White / Black preview
          </p>

          <div className="flex gap-3">
            {!session?.user && (
              <Button
                variant="outline"
                onClick={handleDownloadWatermarked}
                disabled={!watermarkedImage}
              >
                <Download className="mr-2 size-4" /> Preview Image
              </Button>
            )}

            <Button
              onClick={handleDownloadClean}
              disabled={loadingClean}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "Download Clean Image"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex justify-center px-4 py-6">
        <div className="flex gap-8 w-full max-w-6xl">

          {/* LEFT: IMAGE AREA */}
          <div className="flex flex-col flex-1 items-center">

            <div
              className={`rounded-xl shadow-lg w-full max-h-[70vh] flex items-center justify-center p-4 ${previewBackgroundClass}`}
            >
              {loadingNewUpload ? (
                <div className="text-gray-600 flex flex-col items-center">
                  <Loader2 className="animate-spin h-8 w-8 mb-2" />
                  Processing…
                </div>
              ) : watermarkedImage ? (
                <img
                  src={watermarkedImage}
                  alt="AI background removal preview"
                  className="object-contain max-w-full max-h-full"
                />
              ) : (
                <div className="text-gray-400 text-lg">
                  Upload an image to start background removal
                </div>
              )}
            </div>

            {/* Upload / Delete */}
            <div className="flex gap-6 mt-6">
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-white border shadow text-3xl text-gray-700">
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
                className="h-16 w-16 flex items-center justify-center rounded-xl bg-white border shadow text-3xl text-gray-700"
              >
                –
              </button>
            </div>
          </div>

          {/* RIGHT: BACKGROUND SELECTOR */}
          <div className="flex flex-col gap-6 pt-4">

            <button
              onClick={() => setBgStyle("none")}
              aria-label="Transparent background preview"
              className={`h-20 w-20 rounded-xl border-4 bg-[url('/checkerboard.png')] bg-repeat ${
                bgStyle === "none" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setBgStyle("white")}
              aria-label="White background preview"
              className={`h-20 w-20 rounded-xl border-4 bg-white ${
                bgStyle === "white" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setBgStyle("black")}
              aria-label="Black background preview"
              className={`h-20 w-20 rounded-xl border-4 bg-black ${
                bgStyle === "black" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
