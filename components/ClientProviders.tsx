// components/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import CreditsPill from "./CreditsPill";
import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auto redirect after 5 free downloads
  useFreeDownloadRedirect();

  return (
    <SessionProvider>
      <header className="w-full flex justify-end p-4">
        <CreditsPill />
      </header>
      {children}
    </SessionProvider>
  );
}
