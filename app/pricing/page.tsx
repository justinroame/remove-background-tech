"use client";

import { useState } from "react";

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

export default function PricingPage() {
  const [paygOption, setPaygOption] = useState("5");
  const [proOption, setProOption] = useState("50");

  // Stripe redirect function
  const startCheckout = async (priceId: string, mode: "payment" | "subscription") => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, mode }),
    });

    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const paygPricing: Record<string, string> = {
    "5": "3",
    "15": "9",
    "50": "26",
    "100": "45",
    "500": "169",
    "1000": "299",
  };

  const proPricing: Record<string, string> = {
    "50": "9",
    "250": "39",
    "500": "79",
    "1000": "129",
    "2500": "199",
    "5000": "299",
  };

  return (
    <div className="w-full flex flex-col items-center px-4 pt-20 pb-32">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
      <p className="text-lg text-gray-600 mb-16">Start free. Scale fast. Never overpay.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full">

        {/* PAY AS YOU GO */}
        <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Pay as you go credits</h2>

          <label className="text-sm text-gray-600 mb-1 block">Amount</label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
            value={paygOption}
            onChange={(e) => setPaygOption(e.target.value)}
          >
            <option value="5">5 credits – $3</option>
            <option value="15">15 credits – $9</option>
            <option value="50">50 credits – $26</option>
            <option value="100">100 credits – $45</option>
            <option value="500">500 credits – $169</option>
            <option value="1000">1000 credits – $299</option>
          </select>

          {/* PRICE */}
          <div className="mb-6 mt-6 flex items-start">
            <span className="text-5xl font-bold text-gray-800">${paygPricing[paygOption]}</span>
          </div>

          {/* BUY BUTTON */}
          <button
            onClick={() => startCheckout(PAYG_PRICE_IDS[paygOption], "payment")}
            className="mb-6 w-full rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
          >
            Buy now
          </button>

          {/* RESTORED ORIGINAL DESCRIPTION WITH BOLD */}
          <div className="space-y-2 text-gray-600 leading-relaxed">
            <p><b>Pay-as-you-go</b> – start small, scale instantly.</p>
            <p>Buy just what you need — no commitment.</p>
            <p>Run out? Top up credits in seconds, or upgrade to a monthly plan anytime.</p>
          </div>
        </div>

        {/* PRO PACKAGE */}
        <div className="relative bg-white p-10 rounded-2xl border-2 border-yellow-400 shadow-xl">

          {/* MOST POPULAR TAG */}
          <span className="absolute -top-3 right-6 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900 shadow">
            Most Popular
          </span>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            Pro Package ⚡
          </h2>
          <p className="text-gray-600 mb-6">
            Use up to <span className="font-semibold">{proOption}</span> credits per month
          </p>

          <label className="text-sm text-gray-600 mb-1 block">Amount</label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
            value={proOption}
            onChange={(e) => setProOption(e.target.value)}
          >
            <option value="50">50 credits – $9 / month</option>
            <option value="250">250 credits – $39 / month</option>
            <option value="500">500 credits – $79 / month</option>
            <option value="1000">1000 credits – $129 / month</option>
            <option value="2500">2500 credits – $199 / month</option>
            <option value="5000">5000 credits – $299 / month</option>
          </select>

          {/* PRICE */}
          <div className="mt-6 mb-6 flex items-start">
            <span className="text-5xl font-bold text-gray-800">${proPricing[proOption]}</span>
            <span className="text-gray-500 text-xl mt-2">/ month</span>
          </div>

          {/* SUBSCRIBE BUTTON */}
          <button
            onClick={() => startCheckout(PRO_PRICE_IDS[proOption], "subscription")}
            className="mb-6 w-full rounded-full bg-blue-600 py-6 text-base font-medium text-white hover:bg-blue-700"
          >
            Subscribe
          </button>

          <div className="text-gray-700 space-y-2 leading-relaxed">
            <p><b>Pro – Removes Watermarks</b></p>
            <p>Full HD Images</p>
            <p>Best Option – Save Money</p>
            <p>Starting at $9 a month cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
