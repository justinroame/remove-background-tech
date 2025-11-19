// components/ClientProviders.tsx — FINAL
"use client";

import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({ children }) {
  useFreeDownloadRedirect();
  return <>{children}</>;
}
