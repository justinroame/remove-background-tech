"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";   // ← REQUIRED

/* ... EXISTING PRICE ID CODE UNCHANGED ... */

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
  const params = useSearchParams();
  const success = params.get("success");

  const { data: session } = useSession();   // ← Detect user login state

  useEffect(() => {
    if (success) window.location.reload();
  }, [success]);

  const [payAsYouGoOption, setPayAsYouGoOption] = useState("5");
  const [proOption, setProOption] = useState("50");

  /* ----- Your existing pricing data stays exactly the same ----- */

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      {/* ---------------- HEADER ---------------- */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              {/* your logo svg stays */}
              <span className="text-xl font-semibold">remove-background.tech</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-bold text-gray-700 hover:text-gray-900">
                Home
              </Link>
              <Link href="/pricing" className="text-sm font-bold text-blue-600">
                Pricing
              </Link>
            </nav>
          </div>

          {/* -------- AUTH BUTTONS FIXED -------- */}
          <div className="flex items-center gap-4">
            {!session ? (
              <>
                <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-bold text-gray-700 hover:text-gray-900">
                  Sign up
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="text-sm font-bold text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --------------- SUCCESS BANNERS --------------- */}
      {/* (KEEP THE REST OF YOUR PAGE EXACTLY AS IT IS) */}

      <main className="mx-auto max-w-7xl px-6 py-16">
        
        {/* ----- PAY AS YOU GO BUTTON FIX ----- */}
        <Button
          className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
          onClick={() => {
            if (!session) {
              signIn(); // ← Redirect to login page automatically
              return;
            }
            startCheckout(PAYG_PRICE_IDS[payAsYouGoOption], "payment");
          }}
        >
          Buy now
        </Button>

        {/* ----- PRO SUBSCRIBE BUTTON FIX ----- */}
        <Button
          className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
          onClick={() => {
            if (!session) {
              signIn(); // ← Forces login first
              return;
            }
            startCheckout(PRO_PRICE_IDS[proOption], "subscription");
          }}
        >
          Subscribe
        </Button>

        {/* The rest stays unchanged... */}

      </main>
    </div>
  );
}
