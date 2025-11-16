// hooks/useFreeDownloadRedirect.ts
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function useFreeDownloadRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const count = Number(localStorage.getItem("free_download_count") || 0);

      // Already on pricing → don't redirect again
      if (pathname === "/pricing") return;

      // Limit: 5 free watermarked downloads
      if (count >= 5) {
        router.push("/pricing");
      }
    } catch (err) {
      console.error("Free download counter error:", err);
    }
  }, [pathname]);
}
