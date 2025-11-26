"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  getGuestUploadCount,
  incrementGuestUpload,
  MAX_GUEST_UPLOADS,
} from "@/lib/guestLimit";

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

  useEffect(() => {
    if (img) setWatermarkedImage(img);
    if (cleanParam) setCleanImage(cleanParam);

    window.scrollTo({ top: 0, behavior: "instant" as any });
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
      image.src = sourceUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject("Image load failed");
      });

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      if (background === "white") ctx.fillStyle = "#ffffff";
      else if (background === "black") ctx.fillStyle = "#000000";

      if (background !== "none") ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    } catch (err) {
      console.error(err);
      alert("Download failed — please try again.");
    }
  }

  /* ---------------- Preview Download ---------------- */
  const handleDownloadWatermarked = async () => {
    if (!watermarkedImage) return;
    await downloadWithBackground(
      watermarkedImage,
      "background-removed-preview.png",
      bgStyle
    );
  };

  /* ---------------- Clean Download ---------------- */
  const handleDownloadClean = async () => {
    if (!session?.user) return router.push("/auth/signup");
    if (!cleanImage) return alert("Your clean image is not ready.");

    setLoadingClean(true);

    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      const data = await res.json();

      if (data.error || res.status === 402) {
        return router.push("/pricing");
      }

      window.dispatchEvent(new Event("credits-updated"));

      await downloadWithBackground(cleanImage, "background-removed.png", bgStyle);
    } catch (err) {
      console.error(err);
      alert("Network error — please try again.");
    } finally {
      setLoadingClean(false);
    }
  };

  /* ---------------- Delete image ---------------- */
  const handleDeleteImage = () => {
    setWatermarkedImage(null);
    setCleanImage(null);
    router.replace("/editor");
    window.scrollTo({ top: 0, behavior: "instant" as any });
  };

  /* ---------------- Upload New ---------------- */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Guest upload limit
    if (!session?.user) {
      const count = getGuestUploadCount();
      if (count >= MAX_GUEST_UPLOADS) {
        return router.push("/auth/signup");
      }
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
      `/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(
        data.clean
      )}`
    );

    setLoadingNewUpload(false);

    window.scrollTo({ top: 0, behavior: "instant" as any });
  }

  const previewBackgroundClass =
    bgStyle === "none"
      ? "bg-[url('/checkerboard.png')] bg-repeat"
      : bgStyle === "white"
      ? "bg-white"
      : "bg-black";

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F6] scroll-mt-0">

      {/* Toolbar */}
      <div className="border-b bg-white shadow-sm sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <span className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-700">
            Background Preview
          </span>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadWatermarked}
              disabled={!watermarkedImage}
            >
              <Download className="mr-2 size-4" /> Preview Image
            </Button>

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
      </div>

      {/* Main layout */}
      <div className="flex justify-center px-4 py-6 pt-4">
        <div className="flex gap-8 w-full max-w-6xl">

          {/* Image */}
          <div className="flex flex-col flex-1 items-center">
            <div
              className={`rounded-xl shadow-lg w-full max-h-[70vh] flex items-center justify-center p-4 ${previewBackgroundClass}`}
            >
              {loadingNewUpload ? (
                <div className="flex flex-col items-center text-gray-600">
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

          {/* Background selector */}
          <div className="flex flex-col gap-6 pt-4">
            <button
              onClick={() => setBgStyle("none")}
              className={`h-20 w-20 rounded-xl border-4 bg-[url('/checkerboard.png')] bg-repeat ${
                bgStyle === "none" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setBgStyle("white")}
              className={`h-20 w-20 rounded-xl border-4 bg-white ${
                bgStyle === "white" ? "border-blue-500 shadow-xl" : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setBgStyle("black")}
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
