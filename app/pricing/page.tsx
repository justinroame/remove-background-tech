"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import GlobalHeader from "@/components/GlobalHeader";

// Stripe Price IDs for one-time (PAYG) packs
const PAYG_PRICE_IDS: Record<string, string> = {
  "5": "price_1SSrc4C7SdJDqSQL9Zl6ZSPz",
  "15": "price_1ST76xC7SdJDqSQLwGjqxRmt",
  "50": "price_1ST7EIC7SdJDqSQLarYb4WgE",
  "100": "price_1ST7EIC7SdJDqSQLa34lWIMK",
  "500": "price_1ST7EIC7SdJDqSQLRLfW3Lbh",
  "1000": "price_1ST7EIC7SdJDqSQL8RFOBHvs",
};

// Stripe Price IDs for subscription plans
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
  if (data?.url) {
    window.location.href = data.url;
  }
}

export default function PricingPage() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const success = params.get("success");
  const cancel = params.get("cancel");

  const [payAsYouGoOption, setPayAsYouGoOption] = useState("50");
  const [proOption, setProOption] = useState("50");

  const buyAction = (priceId: string, mode: "payment" | "subscription") => {
    if (!session?.user) {
      window.location.href = "/auth/signup";
      return;
    }

    startCheckout(priceId, mode);
  };

  const getPaygPriceLabel = (value: string) => {
    switch (value) {
      case "5":
        return "3";
      case "15":
        return "9";
      case "50":
        return "26";
      case "100":
        return "45";
      case "500":
        return "169";
      case "1000":
      default:
        return "299";
    }
  };

  const getProPriceLabel = (value: string) => {
    switch (value) {
      case "50":
        return "9";
      case "250":
        return "39";
      case "500":
        return "79";
      case "1000":
        return "169";
      case "2500":
        return "299";
      case "5000":
      default:
        return "499";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F6]">
      {/* Global fixed header with logo, auth buttons and credits pill */}
      <GlobalHeader />

      {/* Push page content below fixed header */}
      <div className="pt-28">
        {/* SUCCESS / CANCEL BANNERS */}
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

        {/* Main pricing content */}
        <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600">
              Start free. Scale fast. Never overpay.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* Pay-as-you-go card */}
            <Card className="flex flex-col rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-6 h-[52px]">
                <h3 className="text-3xl font-bold text-gray-800">
                  Pay as you go credits
                </h3>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm text-gray-600">Amount</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <div className="mb-6 h-[60px] flex items-start">
                <span className="text-5xl font-bold text-gray-800">
                  ${getPaygPriceLabel(payAsYouGoOption)}
                </span>
              </div>

              <Button
                className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
                onClick={() => buyAction(PAYG_PRICE_IDS[payAsYouGoOption], "payment")}
              >
                Buy now
              </Button>

              <div className="space-y-3 text-sm text-gray-600">
                <p className="leading-relaxed text-gray-600 font-bold text-xl">
                  Pay-as-you-go – start small, scale instantly.
                  <br />
                  Buy just what you need — no commitment.
                  <br />
                  Run out? Top up credits in seconds, or upgrade to a monthly
                  plan anytime.
                </p>
              </div>
            </Card>

            {/* Pro subscription card */}
            <Card className="relative flex flex-col rounded-2xl border-2 border-yellow-400 bg-white p-8 shadow-xl">
              <div className="absolute -top-3 right-6">
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
                  Most Popular
                </span>
              </div>

              <div className="mb-6 h-[52px]">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-3xl font-bold text-gray-800">Pro Package</h3>
                  <Zap className="size-6 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-sm text-gray-600">
                  Use up to <span className="font-semibold">{proOption} credits</span>{" "}
                  per month
                </p>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm text-gray-600">Amount</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <div className="mb-6 h-[60px] flex items-start">
                <span className="text-5xl font-bold text-gray-800">
                  ${getProPriceLabel(proOption)}
                </span>
                <span className="text-gray-600"> / month</span>
              </div>

              <Button
                className="mb-6 rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
                onClick={() => buyAction(PRO_PRICE_IDS[proOption], "subscription")}
              >
                Subscribe
              </Button>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-gray-800 font-bold text-xl">
                    Pro - Removes Watermarks
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="font-bold text-xl">Full HD Images</li>
                    <li className="font-bold text-xl">Best Option - Save Money</li>
                    <li className="font-bold text-xl">
                      Starting at $9 a month, cancel anytime
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
