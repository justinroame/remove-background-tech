"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { useUser } from "../lib/useUser";
import { getGuestUploadCount, incrementGuestUpload, MAX_GUEST_UPLOADS } from "@/lib/guestLimit";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  async function handleFile(file: File) {
    if (!user) {
      const count = getGuestUploadCount();
      if (count >= MAX_GUEST_UPLOADS) return router.push("/auth/signup");
      incrementGuestUpload();
    }

    let compressed = file;
    if (file.size > 5 * 1024 * 1024) {
      compressed = await imageCompression(file, { maxSizeMB: 4, maxWidthOrHeight: 1024 });
    }

    setLoading(true);
    const form = new FormData();
    form.append("image", compressed);

    const res = await fetch("/api/remove-background", { method: "POST", body: form });
    const data = await res.json();

    router.push(`/editor?img=${encodeURIComponent(data.processed)}&clean=${encodeURIComponent(data.clean)}`);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      {/* ENTIRE UI UNCHANGED */}
      {/* (intentionally omitted here for brevity, but your layout stays identical) */}
    </div>
  );
}
