"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

/* ---------------------------------------------------
   PRICE IDS (RESTORED SO BUILD DOES NOT BREAK)
----------------------------------------------------*/

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

/* ---------------------------------------------------
   CHECKOUT HANDLER
----------------------------------------------------*/

async function startCheckout(priceId: string, mode: "payment" | "subscription") {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, mode }),
  });

  const data = await res.json();

  if (data?.url) {
    window.location.href = data.url;
  }
}

/* ---------------------------------------------------
   MAIN PRICING COMPONENT
----------------------------------------------------*/

export default function PricingInner() {
  const params = useSearchParams();
  const success = params.get("success");

  const { data: session } = useSession();

  useEffect(() => {
    if (success) window.location.reload();
  }, [success]);

  const [payAsYouGoOption, setPayAsYouGoOption] = useState("5");
  const [proOption, setProOption] = useState("50");

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      {/* ---------------- HEADER ---------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-xl font-semibold">remove-background.tech</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-bold text-gray-700 hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-bold text-blue-600"
              >
                Pricing
              </Link>
            </nav>
          </div>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-4">
            {!session ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-gray-700 hover:text-gray-900"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-bold text-gray-700 hover:text-gray-900"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="text-sm font-bold text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN PAGE BODY */}
      <main className="mx-auto max-w-7xl px-6 py-16">

        {/* ---------- BUY NOW FIX ---------- */}
        <Button
          className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
          onClick={() => {
            if (!session) return signIn();
            startCheckout(PAYG_PRICE_IDS[payAsYouGoOption], "payment");
          }}
        >
          Buy now
        </Button>

        {/* ---------- SUBSCRIBE FIX ---------- */}
        <Button
          className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
          onClick={() => {
            if (!session) return signIn();
            startCheckout(PRO_PRICE_IDS[proOption], "subscription");
          }}
        >
          Subscribe
        </Button>

        {/* Optional: keep your other pricing UI here */}

      </main>
    </div>
  );
}
