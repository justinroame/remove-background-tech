"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import CreditsPill from "@/components/CreditsPill";

export default function GlobalHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-semibold tracking-tight">
              remove-background<span className="text-blue-600">.tech</span>
            </span>
          </Link>

          <Link href="/pricing">Pricing</Link>
        </div>

        <div className="flex items-center gap-6">
          {status === "loading" ? null : session?.user ? (
            <>
              <CreditsPill />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-5 py-2.5 bg-red-600 text-white rounded-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Log in</Link>
              <Link href="/auth/signup" className="px-6 py-2.5 bg-blue-600 text-white rounded-full">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
