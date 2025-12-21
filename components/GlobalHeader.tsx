// components/GlobalHeader.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import CreditsPill from "./CreditsPill";
import { Menu, X } from "lucide-react";
import { useUser } from "@/lib/useUser";

export default function GlobalHeader() {
  const { user, loading, logout } = useUser();
  const [open, setOpen] = useState(false);

  if (loading) {
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
        {/* LEFT — Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute w-5 h-5 rounded-md border-2 border-white/40"
              style={{ top: "6px", left: "6px" }}
            />
            <div
              className="absolute w-4 h-4 rounded-md bg-white"
              style={{ bottom: "6px", right: "6px" }}
            />
          </div>

          <span className="text-xl font-semibold tracking-tight">
            <span className="text-gray-700">remove-background</span>
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-bold">
              .tech
            </span>
          </span>
        </Link>

        {/* RIGHT — Desktop Links */}
        <div className="hidden sm:flex items-center gap-8">
          <Link href="/pricing" className="text-sm font-medium hover:text-gray-900">
            Pricing
          </Link>

          {user ? (
            <>
              <CreditsPill />
              <button
                onClick={logout}
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

        {/* RIGHT — Hamburger (mobile only) */}
        <button
          className="sm:hidden p-2 rounded-md"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="sm:hidden bg-white border-t shadow-md px-6 py-4 space-y-4 animate-slideDown">
          <Link
            href="/pricing"
            className="block text-lg font-medium text-gray-800"
            onClick={() => setOpen(false)}
          >
            Pricing
          </Link>

          {user ? (
            <>
              <div className="pt-2">
                <CreditsPill />
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full mt-3 px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="block text-lg font-medium text-gray-800"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>

              <Link
                href="/auth/signup"
                className="block text-center mt-3 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                onClick={() => setOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
