// components/ClientProviders.tsx — FINAL
"use client";

import { SessionProvider } from "next-auth/react";
import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode; // ✅ proper typing
}) {
  useFreeDownloadRedirect();

  return (
    <SessionProvider
      refetchInterval={0}           // ✅ stops polling flicker
      refetchOnWindowFocus={false}  // ✅ stops tab-focus flicker
    >
      {children}
    </SessionProvider>
  );
}
