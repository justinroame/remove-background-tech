// app/pricing/pricing-inner.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const PAYG_PRICE_IDS: Record<string, string> = {
  "5": "price_1SSrc4C7SdJDqSQL9Zl6ZSPz",
  "15": "price_1ST76xC7SdJDqSQLwGjqxRmt",
  "50": "price_1ST7EIC7SdJDqSQLarYb4WgE",
  "100": "price_1ST7EIC7SdJDqSQLa34lWIMK",
  "500": "price_1ST7EIC7SdJDqSQLRLfW3Lbh",
  "1000": "price_1ST7EIC7SdJDqSQL8RFOBHvs",
};

const PRO_PRICE_IDS: Record<string, string> = {
  "50": "price_1ST85YC7SdJDqSQLl9BDMF9i",
  "250": "price_1ST85YC7SdJDqSQLmyewfZya",
  "500": "price_1ST85YC7SdJDqSQL2iAc6jQN",
  "1000": "price_1ST85YC7SdJDqSQLYsOqCYBO",
  "2500": "price_1ST85YC7SdJDqSQLdSUGJhXJ",
  "5000": "price_1ST85YC7SdJDqSQLAKFbT9fN",
};

async function startCheckout(priceId: string, mode: "payment" | "subscription") {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, mode }),
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
}

export default function PricingInner() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const success = params.get("success");
  const cancel = params.get("cancel");

  const [payAsYouGoOption, setPayAsYouGoOption] = useState("50");
  const [proOption, setProOption] = useState("50");

  const buyAction = (priceId: string, mode: "payment" | "subscription") => {
    if (!session) {
      window.location.href = "/auth/signup";   // ← NOW CORRECT PATH
      return;
    }
    startCheckout(priceId, mode);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      {success && (
        <div className="w-full bg-green-600 text-white p-4 text-center font-bold text-lg">
          Payment successful! Your credits have been added.
        </div>
      )}
      {cancel && (
        <div className="w-full bg-yellow-600 text-white p-4 text-center font-bold text-lg">
          Payment cancelled — no charges. Try again anytime.
        </div>
      )}

      {/* HEADER — with correct links */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform hover:scale-105">
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
                  <rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="2" rx="2" opacity="0.4" />
                  <rect x="10" y="10" width="12" height="12" fill="currentColor" rx="2" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-gray-700">remove-background</span>
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent font-bold">.tech</span>
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6 font-semibold text-sm">
            <Link href="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">Log In</Link>
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">Sign Up</Link>
          </nav>
        </div>
      </header>

      {/* REST OF YOUR BEAUTIFUL PRICING PAGE — unchanged */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        {/* ... all your existing pricing cards ... */}
      </main>
    </div>
  );
}