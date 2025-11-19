// components/ClientProviders.tsx ← FINAL WORKING VERSION (no Header.tsx needed)
"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import Link from "next/link";
import CreditsPill from "./CreditsPill";
import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useFreeDownloadRedirect();
  const { data: session, status } = useSession();

  // Prevent flash while loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 bg-white border-b">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <main className="pt-20">{children}</main>
      </div>
    );
  }

  return (
    <SessionProvider>
      {/* SINGLE PERFECT HEADER (inline, no external file needed)
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          Left side — Logo
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="2" rx="2" opacity="0.4" />
                <rect x="10" y="10" width="12" height="12" fill="currentColor" rx="2" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight">
              <span className="text-gray-700">remove-background</span>
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-bold">.tech</span>
            </span>
          </Link>

          Right side — Auth
          <div className="flex items-center gap-6">
            {session?.user ? (
              <>
                <CreditsPill />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20">
        {children}
      </main>
    </SessionProvider>
  );
}