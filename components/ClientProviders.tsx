// components/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import CreditsPill from "./CreditsPill";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <header className="w-full flex justify-end p-4">
        <CreditsPill />
      </header>
      {children}
    </SessionProvider>
  );
}