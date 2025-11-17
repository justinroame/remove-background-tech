// components/ClientProviders.tsx
"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import CreditsPill from "./CreditsPill";
import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";
import Link from "next/link";

function AuthHeader() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <div className="flex items-center gap-6">
      <CreditsPill />

      {session?.user ? (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-300">{session.user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-white hover:underline cursor-pointer"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6 text-sm">
          <Link href="/auth/login" className="text-white hover:underline">
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-white font-medium transition"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useFreeDownloadRedirect();

  return (
    <SessionProvider>
      <header className="fixed top-0 right-0 z-50 p-6 w-full flex justify-end pointer-events-auto">
        <AuthHeader />
      </header>
      {children}
    </SessionProvider>
  );
}