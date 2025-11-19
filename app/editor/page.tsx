// app/editor/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useSession } from "next-auth/react";

const FREE_UPLOAD_KEY = "rb_free_upload_count";
const FREE_UPLOAD_LIMIT = 5;

function EditorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, update } = useSession();

  const img = params.get("img");
  const cleanParam = params.get("clean");

  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(img || null);
  const [cleanImage, setCleanImage] = useState<string | null>(
    cleanParam && cleanParam !== "null" && cleanParam !== "undefined" ? cleanParam : null
  );
  const [loadingClean, setLoadingClean] = useState(false);

  // Fix flashing: force session refresh once
  useEffect(() => {
    update();
  }, [update]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isLoggedIn = !!session?.user;

    // Guest upload limiting via localStorage
    if (!isLoggedIn && typeof window !== "undefined") {
      const current = Number(localStorage.getItem(FREE_UPLOAD_KEY) || "0");
      if (current >= FREE_UPLOAD_LIMIT) {
        alert("You’ve used your 5 free images. Please upgrade to continue using the editor.");
        router.push("/pricing");
        return;
      }
    }

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Processing failed");

      setWatermarkedImage(data.processed);
      setCleanImage(data.clean || null);

      if (typeof window !== "undefined") {
        const search = new URLSearchParams();
        if (data.processed) search.set("img", data.processed);
        if (data.clean) search.set("clean", data.clean);
        router.replace(`/editor?${search.toString()}`);
      }

      // Increment guest upload count only on success
      if (!isLoggedIn && typeof window !== "undefined") {
        const current = Number(localStorage.getItem(FREE_UPLOAD_KEY) || "0");
        localStorage.setItem(FREE_UPLOAD_KEY, String(current + 1));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to remove background");
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url + "?fl_attachment";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadWatermarked = () => {
    if (!watermarkedImage) return;
    triggerDownload(watermarkedImage, "with-watermark.png");
  };

  const handleDownloadClean = async () => {
    // If not logged in → push to signup (CTA)
    if (!session?.user) {
      router.push("/auth/signup");
      return;
    }

    if (!cleanImage) {
      alert("Clean image not ready yet, please re-upload.");
      return;
    }

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
          router.push("/pricing");
        } else {
          alert(data.error || "Not enough credits");
        }
        return;
      }

      triggerDownload(cleanImage, "clean-no-background.png");
    } catch {
      alert("Network error — please try again");
    } finally {
      setLoadingClean(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F6]">
      {/* Toolbar only — no header here */}
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 size-4" />
              {loadingClean ? "Processing…" : "No watermark"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1">
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="relative flex h-full w-full max-w-4xl items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
            {watermarkedImage ? (
              <img src={watermarkedImage} alt="Processed" className="max-h-full max-w-full rounded object-contain" />
            ) : (
              <div className="text-gray-400 text-lg">Upload an image to get started</div>
            )}
          </div>

          <div className="mt-8">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex size-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition">
                <svg width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="16" y1="8" x2="16" y2="24" />
                  <line x1="8" y1="16" x2="24" y2="16" />
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
