"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";

function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const img = params.get("img");
  const cleanParam = params.get("clean");

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);

  // NEW: background selector
  const [bgStyle, setBgStyle] = useState<"none" | "white" | "black">("white");

  // Hydrate from URL params
  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);
  }, [img, cleanParam]);

  // Universal Download Handler
  async function triggerDownload(url: string, filename: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("DOWNLOAD ERROR:", err);
      alert("Failed to download file.");
    }
  }

  // Watermarked Download
  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    triggerDownload(watermarkedImage, "with-watermark.png");
  };

  // Clean Download + Credit Deduction
  const handleDownloadClean = async () => {
    if (status === "loading") return;

    if (!session?.user) {
      return router.push("/auth/signup");
    }

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

      if (!res.ok) {
        return alert(data.error || "Unexpected credit error.");
      }

      // Tell CreditsPill to update
      window.dispatchEvent(new CustomEvent("credits-updated"));

      if (cleanImage) {
        await triggerDownload(cleanImage, "clean-no-background.png");
      } else {
        alert("Clean image is not ready yet.");
      }
    } catch (err) {
      console.error("CLEAN DL ERROR:", err);
      alert("Network error — try again.");
    } finally {
      setLoadingClean(false);
    }
  };

  // Delete Image
  const handleDeleteImage = () => {
    setWatermarkedImage(null);
    setCleanImage(null);
    router.replace("/editor");
  };

  // Upload new image
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
      `/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(
        data.clean || ""
      )}`
    );
  }

  // Preview Background
  const backgroundClass =
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
            <Button variant="outline" onClick={handleDownloadWatermarked} disabled={!watermarkedImage}>
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

      {/* Main Editor Layout */}
      <div className="flex flex-1">

        {/* LEFT — IMAGE + upload/delete */}
        <div className="flex flex-1 flex-col items-center justify-center p-8">

          <div
            className={`relative flex h-full w-full max-w-4xl items-center justify-center rounded-xl shadow-lg transition ${backgroundClass}`}
          >
            {watermarkedImage ? (
              <img
                src={watermarkedImage}
                alt="Processed"
                className="max-h-full max-w-full rounded object-contain"
              />
            ) : (
              <div className="text-gray-400 text-lg">Upload an image to begin</div>
            )}
          </div>

          {/* Upload / Delete */}
          <div className="mt-8 flex items-center gap-6">

            {/* Upload */}
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex size-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow-md text-3xl text-gray-700 hover:bg-gray-50">
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

            {/* Delete */}
            <button
              onClick={handleDeleteImage}
              className="flex size-16 items-center justify-center rounded-xl bg-white border border-gray-300 shadow-md text-3xl text-gray-700 hover:bg-gray-50"
            >
              –
            </button>
          </div>
        </div>

        {/* RIGHT — Background Selector */}
        <div className="w-32 flex flex-col items-center gap-6 pr-10 pt-20">

          {/* No background */}
          <button
            onClick={() => setBgStyle("none")}
            className={`h-20 w-20 rounded-xl border-4 ${
              bgStyle === "none" ? "border-blue-500 shadow-lg" : "border-gray-300"
            } bg-[url('/checkerboard.png')] bg-repeat`}
          />

          {/* White */}
          <button
            onClick={() => setBgStyle("white")}
            className={`h-20 w-20 rounded-xl border-4 ${
              bgStyle === "white" ? "border-blue-500 shadow-lg" : "border-gray-300"
            } bg-white`}
          />

          {/* Black */}
          <button
            onClick={() => setBgStyle("black")}
            className={`h-20 w-20 rounded-xl border-4 ${
              bgStyle === "black" ? "border-blue-500 shadow-lg" : "border-gray-300"
            } bg-black`}
          />

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
