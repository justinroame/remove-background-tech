// components/GlobalHeader.tsx — FINAL
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import CreditsPill from "./CreditsPill";

export default function GlobalHeader() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-11 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg" />
            <span className="text-xl font-semibold tracking-tight">
              <span className="text-gray-700">remove-background</span>
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-bold">
                .tech
              </span>
            </span>
          </Link>

          <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Pricing
          </Link>
        </div>

        {/* Right side */}
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
              <Link href="/auth/login" className="text-sm font-medium hover:text-gray-900">
                Log in
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
  );
}
