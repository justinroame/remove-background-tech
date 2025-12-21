// components/ClientProviders.tsx
"use client";

import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useFreeDownloadRedirect();
  return <>{children}</>;
}
