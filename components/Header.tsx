"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import CreditsPill from "@/components/CreditsPill";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full flex items-center justify-between p-4 border-b border-gray-200">
      <Link href="/" className="text-xl font-semibold">
        Remove Background Tech
      </Link>

      <div className="flex items-center gap-4">
        {/* Credits pill visible only when logged in */}
        {session?.user && <CreditsPill />}

        {/* If logged in → show Logout */}
        {session?.user ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <>
            {/* If logged out → show Login + Signup */}
            <Link
              href="/auth/login"
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
