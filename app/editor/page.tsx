"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const img = params.get("img");
  const cleanParam = params.get("clean");

  const { data: session } = useSession();

  const [selectedBackground, setSelectedBackground] = useState<
    "transparent" | "white" | "black"
  >("transparent");

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(img);
  const [cleanImage, setCleanImage] = useState<string | null>(cleanParam);
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);
  const [loadingWatermarked, setLoadingWatermarked] = useState(false);

  // Fetch credits for logged-in user
  useEffect(() => {
    const fetchCredits = async () => {
      if (!session?.user?.id) return;
      try {
        const userId = Number((session.user as any).id);
        const res = await fetch(`/api/credits/summary?userId=${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        setCredits(data.total);
      } catch (e) {
        console.error("Failed to fetch credits", e);
      }
    };
    fetchCredits();
  }, [session]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reuse the same flow as homepage: send to /api/remove-background
    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setWatermarkedImage(data.processed);
      setCleanImage(data.clean);

      // Update URL params so refresh keeps current image
      const newUrl = `/editor?img=${encodeURIComponent(
        data.processed
      )}&clean=${encodeURIComponent(data.clean)}`;
      router.replace(newUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to process new image");
    }
  };

  const handleDeleteImage = () => {
    setWatermarkedImage(null);
    setCleanImage(null);
  };

  function triggerDownload(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Download WITH watermark
  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;

    // Guest: limit to 5 free watermarked downloads
    if (!session?.user) {
      const key = "freeWatermarkedDownloads";
      const current = Number(localStorage.getItem(key) || "0");
      if (current >= 5) {
        // send to pricing after free limit
        router.push("/pricing");
        return;
      }
      localStorage.setItem(key, String(current + 1));
    }

    setLoadingWatermarked(true);
    try {
      triggerDownload(watermarkedImage, "remove-background-watermarked.png");
    } finally {
      setLoadingWatermarked(false);
    }
  };

  // Download WITHOUT watermark (uses 1 credit)
  const handleDownloadClean = async () => {
    if (!cleanImage) {
      alert("Clean image not available.");
      return;
    }

    // Must be logged in for clean download
    if (!session?.user) {
      // Redirect to signup, then back to editor
      const next = `/editor?img=${encodeURIComponent(
        watermarkedImage || ""
      )}&clean=${encodeURIComponent(cleanImage)}`;
      router.push(`/signup?next=${encodeURIComponent(next)}`);
      return;
    }

    const userId = Number((session.user as any).id);

    // Must have credits
    if (credits !== null && credits <= 0) {
      router.push("/pricing");
      return;
    }

    setLoadingClean(true);
    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, count: 1 }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || "Not enough credits");
        return;
      }

      setCredits(data.total);
      triggerDownload(cleanImage, "remove-background-clean.png");
    } catch (err) {
      console.error("Clean download error:", err);
      alert("Failed to consume credit");
    } finally {
      setLoadingClean(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <rect
                    x="2"
                    y="2"
                    width="12"
                    height="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    rx="2"
                    opacity="0.4"
                  />
                  <rect
                    x="10"
                    y="10"
                    width="12"
                    height="12"
                    fill="currentColor"
                    rx="2"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-gray-700">remove-background</span>
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-bold">
                  .tech
                </span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm text-gray-700 hover:text-gray-900">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Simple credit badge if logged in */}
            {session?.user && (
              <span className="text-sm text-gray-700">
                Credits: {credits ?? "…"}
              </span>
            )}
            <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">
              Log in
            </Link>
            <Link href="/signup" className="text-sm text-gray-700 hover:text-gray-900">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Background
          </span>

          <div className="flex gap-3">
            {/* Download with watermark */}
            <Button
              variant="outline"
              className="rounded-full px-6 py-2 text-sm font-medium"
              onClick={handleDownloadWatermarked}
              disabled={!watermarkedImage || loadingWatermarked}
            >
              <Download className="mr-2 size-4" />
              {loadingWatermarked ? "Downloading…" : "With watermark"}
            </Button>

            {/* Download without watermark */}
            <Button
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={handleDownloadClean}
              disabled={!cleanImage || loadingClean}
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1">
        {/* Canvas */}
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div
            className="relative flex h-full w-full items-center justify-center rounded-xl shadow-lg"
            style={{
              backgroundColor:
                selectedBackground === "transparent"
                  ? "#FFFFFF"
                  : selectedBackground === "white"
                  ? "#FFFFFF"
                  : "#000000",
              backgroundImage:
                selectedBackground === "transparent"
                  ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                  : "none",
              backgroundSize:
                selectedBackground === "transparent" ? "20px 20px" : "auto",
              backgroundPosition:
                selectedBackground === "transparent"
                  ? "0 0, 0 10px, 10px -10px, -10px 0px"
                  : "0 0",
            }}
          >
            {watermarkedImage && (
              <img
                src={watermarkedImage}
                className="max-h-full max-w-full rounded object-contain"
                alt="Result"
              />
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            {/* Upload */}
            <label htmlFor="image-upload">
              <div className="flex size-12 cursor-pointer items-center justify-center rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50">
                <svg
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </label>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Delete */}
            {watermarkedImage && (
              <button
                onClick={handleDeleteImage}
                className="flex size-12 items-center justify-center rounded-lg border-2 border-gray-300 hover:border-red-500 hover:bg-red-50"
              >
                <svg width="24" height="24" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-white p-8">
          <h3 className="mb-6 text-center text-sm font-semibold text-gray-600">
            Color
          </h3>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSelectedBackground("transparent")}
              className={`flex size-20 items-center justify-center rounded-xl border-4 ${
                selectedBackground === "transparent"
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
              }}
            />

            <button
              onClick={() => setSelectedBackground("white")}
              className={`size-20 rounded-xl border-4 bg-white ${
                selectedBackground === "white"
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
            />

            <button
              onClick={() => setSelectedBackground("black")}
              className={`size-20 rounded-xl border-4 bg-black ${
                selectedBackground === "black"
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
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
