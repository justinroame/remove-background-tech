// app/pricing/pricing-inner.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* =========================
   STRIPE PRICE IDS — ONLY CHANGE THE 20-CREDIT LINE
   ========================= */

const PAYG_PRICE_IDS: Record<string, string> = {
  "5":    "price_1SSrc4C7SdJDqSQL9Zl6ZSPz",
  "15":   "price_1ST76xC7SdJDqSQLwGjqxRmt",
  "50":   "price_1ST7EIC7SdJDqSQLarYb4WgE",
  "100":  "price_1ST7EIC7SdJDqSQLa34lWIMK",
  "500":  "price_1ST7EIC7SdJDqSQLRLfW3Lbh",
  "1000": "price_1ST7EIC7SdJDqSQL8RFOBHvs",
  "20":   "price_1SczVNC7SdJDqSQLfhP2q6u8", // ← REPLACE THIS ONE LINE
};

const PRO_PRICE_IDS: Record<string, string> = {
  "50":   "price_1ST85YC7SdJDqSQLl9BDMF9i",
  "250":  "price_1ST85YC7SdJDqSQLmyewfZya",
  "500":  "price_1ST85YC7SdJDqSQL2iAc6jQN",
  "1000": "price_1ST85YC7SdJDqSQLYsOqCYBO",
  "2500": "price_1ST85YC7SdJDqSQLdSUGJhXJ",
  "5000": "price_1ST85YC7SdJDqSQLAKFbT9fN",
};

/* =========================
   CHECKOUT HELPER
   ========================= */

async function startCheckout(priceId: string, mode: "payment" | "subscription") {
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, mode }),
    });

    const data = await res.json();

    if (!data?.url) {
      alert("Checkout failed. Please try again.");
      return;
    }

    window.location.href = data.url;
  } catch {
    alert("Network error. Please try again.");
  }
}

/* =========================
   MAIN COMPONENT
   ========================= */

export default function PricingInner() {
  const { data: session } = useSession();
  const params = useSearchParams();

  const success = params.get("success");
  const cancel = params.get("cancel");
  const fromPaywall = params.get("from") === "paywall";

  const [paygOption, setPaygOption] = useState(fromPaywall ? "20" : "5");
  const [proOption, setProOption] = useState("50");

  const buy = (priceId: string | undefined, mode: "payment" | "subscription") => {
    if (!priceId) {
      alert("Pricing error — please refresh.");
      return;
    }
    if (!session?.user) {
      window.location.href = "/auth/signup";
      return;
    }
    startCheckout(priceId, mode);
  };

  return (
    <>
      {/* VALID JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How much does it cost to remove a background from an image?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can buy credits starting at $3 or choose a Pro subscription starting at $9/month.",
                },
              },
            ],
          }),
        }}
      />

      {success && (
        <div className="w-full bg-green-600 text-white p-4 text-center font-bold text-lg">
          Payment successful! Credits added.
        </div>
      )}
      {cancel && (
        <div className="w-full bg-yellow-600 text-white p-4 text-center font-bold text-lg">
          Payment cancelled — try again anytime.
        </div>
      )}

      {fromPaywall && (
        <div className="mx-auto max-w-4xl mb-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white shadow-2xl">
          <p className="text-3xl font-bold mb-3">
            Unlock your image now — 20 removals for only $2.99
          </p>
          <p className="text-lg opacity-90">
            Most users choose this pack · one-time payment · instant access
          </p>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            Background Remover Pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Simple and flexible. Buy credits or subscribe.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* PAY-AS-YOU-GO */}
          <Card
            className={`flex flex-col rounded-2xl bg-white p-8 shadow-lg ${
              fromPaywall && paygOption === "20" ? "ring-4 ring-green-500 ring-offset-4" : ""
            }`}
          >
            <h3 className="text-3xl font-bold mb-2">Pay-as-you-go Credits</h3>

            <select
              className="w-full rounded-lg border px-4 py-3 mb-6"
              value={paygOption}
              onChange={(e) => setPaygOption(e.target.value)}
            >
              <option value="20">20 – $2.99 (Recommended)</option>
              <option value="5">5 – $3</option>
              <option value="15">15 – $9</option>
              <option value="50">50 – $26</option>
              <option value="100">100 – $45</option>
              <option value="500">500 – $169</option>
              <option value="1000">1000 – $299</option>
            </select>

            <Button
              className="rounded-full bg-blue-600 py-6 text-white hover:bg-blue-700"
              onClick={() => buy(PAYG_PRICE_IDS[paygOption], "payment")}
            >
              Buy Credits
            </Button>
          </Card>

          {/* PRO SUBSCRIPTION */}
          <Card className="relative flex flex-col rounded-2xl border-2 border-yellow-400 bg-white p-8 shadow-xl">
            <div className="absolute -top-3 right-6 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold">
              Most Popular
            </div>

            <h3 className="text-3xl font-bold mb-2">Pro Subscription</h3>

            <select
              className="w-full rounded-lg border px-4 py-3 mb-6"
              value={proOption}
              onChange={(e) => setProOption(e.target.value)}
            >
              <option value="50">50 – $9 / mo</option>
              <option value="250">250 – $39 / mo</option>
              <option value="500">500 – $79 / mo</option>
              <option value="1000">1000 – $169 / mo</option>
              <option value="2500">2500 – $299 / mo</option>
              <option value="5000">5000 – $499 / mo</option>
            </select>

            <Button
              className="rounded-full bg-blue-600 py-6 text-white hover:bg-blue-700"
              onClick={() => buy(PRO_PRICE_IDS[proOption], "subscription")}
            >
              Subscribe
            </Button>
          </Card>
        </div>
      </main>
    </>
  );
}