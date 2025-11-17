"use client";

import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header"; // <- this is the new fixed header
import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useFreeDownloadRedirect();

  return (
    <SessionProvider>
      <Header />   {/* <-- This fixes all header logic! */}
      {children}
    </SessionProvider>
  );
}
