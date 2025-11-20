// app/pricing/pricing-inner.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// PAYG prices
const PAYG_PRICE_IDS: Record<string, string> = {
  "5": "price_1SSrc4C7SdJDqSQL9Zl6ZSPz",
  "15": "price_1ST76xC7SdJDqSQLwGjqxRmt",
  "50": "price_1ST7EIC7SdJDqSQLarYb4WgE",
  "100": "price_1ST7EIC7SdJDqSQLa34lWIMK",
  "500": "price_1ST7EIC7SdJDqSQLRLfW3Lbh",
  "1000": "price_1ST7EIC7SdJDqSQL8RFOBHvs",
};

// Subscription prices
const PRO_PRICE_IDS: Record<string, string> = {
  "50": "price_1ST85YC7SdJDqSQLl9BDMF9i",
  "250": "price_1ST85YC7SdJDqSQLmyewfZya",
  "500": "price_1ST85YC7SdJDqSQL2iAc6jQN",
  "1000": "price_1ST85YC7SdJDqSQLYsOqCYBO",
  "2500": "price_1ST85YC7SdJDqSQLdSUGJhXJ",
  "5000": "price_1ST85YC7SdJDqSQLAKFbT9fN",
};

// Unified checkout function
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

  // FIX: Default to **first item** in each dropdown
  const [payAsYouGoOption, setPayAsYouGoOption] = useState("5");
  const [proOption, setProOption] = useState("50");

  const buy = (priceId: string, mode: "payment" | "subscription") => {
    if (!session?.user) {
      window.location.href = "/auth/signup";
      return;
    }
    startCheckout(priceId, mode);
  };

  return (
    <>
      {/* SUCCESS / CANCEL BANNERS */}
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

      {/* MAIN LAYOUT */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600">Start free. Scale fast. Never overpay.</p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* PAYG CARD */}
          <Card className="flex flex-col rounded-2xl bg-white p-8 shadow-lg">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              Pay as you go credits
            </h3>

            <label className="mb-2 block text-sm text-gray-600">Amount</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-3 mb-6"
              value={payAsYouGoOption}
              onChange={(e) => setPayAsYouGoOption(e.target.value)}
            >
              <option value="5">5 credits - $3</option>
              <option value="15">15 credits - $9</option>
              <option value="50">50 credits - $26</option>
              <option value="100">100 credits - $45</option>
              <option value="500">500 credits - $169</option>
              <option value="1000">1000 credits - $299</option>
            </select>

            {/* Dynamic price */}
            <div className="mb-6 text-5xl font-bold text-gray-800">
              {payAsYouGoOption === "5" && "$3"}
              {payAsYouGoOption === "15" && "$9"}
              {payAsYouGoOption === "50" && "$26"}
              {payAsYouGoOption === "100" && "$45"}
              {payAsYouGoOption === "500" && "$169"}
              {payAsYouGoOption === "1000" && "$299"}
            </div>

            <Button
              className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
              onClick={() => buy(PAYG_PRICE_IDS[payAsYouGoOption], "payment")}
            >
              Buy now
            </Button>

            <p className="text-gray-600 font-bold text-xl leading-relaxed">
              Pay-as-you-go – start small, scale instantly.<br />
              Buy only what you need — no commitment.<br />
              Credits expire in 30 days.
            </p>
          </Card>

          {/* SUBSCRIPTION CARD */}
          <Card className="relative flex flex-col rounded-2xl border-2 border-yellow-400 bg-white p-8 shadow-xl">
            <div className="absolute -top-3 right-6">
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
                Most Popular
              </span>
            </div>

            <h3 className="text-3xl font-bold text-gray-800 mb-2">Pro Package</h3>
            <p className="text-sm text-gray-600 mb-6">
              Use up to <span className="font-semibold">{proOption}</span> credits per month
            </p>

            <label className="mb-2 block text-sm text-gray-600">Amount</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-3 mb-6"
              value={proOption}
              onChange={(e) => setProOption(e.target.value)}
            >
              <option value="50">50 credits - $9 / month</option>
              <option value="250">250 credits - $39 / month</option>
              <option value="500">500 credits - $79 / month</option>
              <option value="1000">1000 credits - $169 / month</option>
              <option value="2500">2500 credits - $299 / month</option>
              <option value="5000">5000 credits - $499 / month</option>
            </select>

            <div className="mb-6 text-5xl font-bold text-gray-800 flex items-start">
              {proOption === "50" && "$9"}
              {proOption === "250" && "$39"}
              {proOption === "500" && "$79"}
              {proOption === "1000" && "$169"}
              {proOption === "2500" && "$299"}
              {proOption === "5000" && "$499"}
              <span className="text-gray-600 text-2xl ml-2">/mo</span>
            </div>

            <Button
              className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
              onClick={() => buy(PRO_PRICE_IDS[proOption], "subscription")}
            >
              Subscribe
            </Button>

            <div>
              <p className="font-bold text-xl text-gray-800 mb-2">
                Pro - Removes Watermarks
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="font-bold text-xl">Full HD Images</li>
                <li className="font-bold text-xl">Best Value</li>
                <li className="font-bold text-xl">Cancel anytime</li>
              </ul>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
