"use client";

import Link from "next/link";
import { useUser } from "@/lib/useUser";
import CreditsPill from "./CreditsPill";

export default function GlobalHeader() {
  const { user } = useUser();

  return (
    <header className="fixed top-0 w-full bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold">
          remove-background.tech
        </Link>

        <nav className="flex gap-4 items-center">
          <Link href="/pricing">Pricing</Link>
          {user ? <CreditsPill /> : <Link href="/auth/signup">Sign up</Link>}
        </nav>
      </div>
    </header>
  );
}
