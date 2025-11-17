"use client";

import CreditsPill from "./CreditsPill";
import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useFreeDownloadRedirect();

  return (
    <>
      <header className="w-full flex justify-end p-4">
        <CreditsPill />
      </header>
      {children}
    </>
  );
}
