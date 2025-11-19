// components/ClientProviders.tsx — FINAL (copy-paste entire file)
"use client";

import { SessionProvider } from "next-auth/react";
import Header from "./Header";                    // ← your beautiful header
import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useFreeDownloadRedirect();

  return (
    <SessionProvider>
      <Header />               {/* ← only one header, no duplicates */}
      <main className="pt-20"> {/* padding so content isn't under fixed header */}
        {children}
      </main>
    </SessionProvider>
  );
}