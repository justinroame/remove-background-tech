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

  const imgParam = params.get("img");

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loadingClean, setLoadingClean] = useState(false);

  // Hydrate watermark from URL
  useEffect(() => {
    if (imgParam) setWatermarkedImage(imgParam);
  }, [imgParam]);

  // --------------------
  // Upload handler
  // --------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");

      // Store both URLs in state
      setWatermarkedImage(data.processed);
      setCleanImage(data.clean); // <- important

      // Update only watermark in URL
      router.replace(`/editor?img=${encodeURIComponent(data.processed)}`);
    } catch (err: any) {
      alert(err.message || "Failed to remove background");
    }
  };

  // --------------------
  // Download helper
  // --------------------
  async function triggerDownload(url: string, filename: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(blobUrl);
  }

  // --------------------
  // Download CLEAN
  // --------------------
  const handleDownloadClean = async () => {
    if (!cleanImage) {
      return alert("Clean image not ready — reupload the image.");
    }

    if (status === "loading") return;
    if (!session?.user) return router.push("/auth/signup");

    setLoadingClean(true);

    try {
      const res = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.error?.toLowerCase().includes("not enough")) {
          return router.push("/pricing");
        }
        return alert(data.error);
      }

      // Successful credit deduction → download clean image
      await triggerDownload(cleanImage, "clean-no-background.png");
    } finally {
      setLoadingClean(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between">
          <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm">Background</span>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => triggerDownload(watermarkedImage!, "with-watermark.png")}
              disabled={!watermarkedImage}
            >
              <Download className="mr-2 size-4" />
              With watermark
            </Button>

            <Button
              onClick={handleDownloadClean}
              disabled={!cleanImage || loadingClean}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="relative w-full max-w-4xl flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
          {watermarkedImage ? (
            <img src={watermarkedImage} className="max-w-full max-h-full object-contain rounded" />
          ) : (
            <div className="text-gray-400 text-lg">Upload an image to get started</div>
          )}
        </div>

        <div className="mt-8">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="size-16 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700">
              +
            </div>
          </label>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
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
