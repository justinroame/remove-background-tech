"use client";

import { useState } from "react";
import { redirectToCheckout } from "@/lib/checkout";
import { PAYG_PRICES, SUB_PRICES } from "@/lib/prices";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [paygAmount, setPaygAmount] = useState("5");
  const [subAmount, setSubAmount] = useState("50");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h1 className="text-center text-4xl font-bold mb-4">
          Choose Your Plan
        </h1>

        <p className="text-center text-gray-500 mb-12">
          Start free. Scale fast. Never overpay.
        </p>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* PAYG CARD */}
          <Card className="border p-6 shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-semibold mb-2">Pay as you go credits</h2>
            </CardHeader>

            <CardContent>
              <label className="block text-sm mb-2">Amount</label>

              <select
                value={paygAmount}
                onChange={(e) => setPaygAmount(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              >
                <option value="5">5 credits – $3</option>
                <option value="15">15 credits – $9</option>
                <option value="50">50 credits – $26</option>
                <option value="100">100 credits – $45</option>
                <option value="400">400 credits – $169</option>
                <option value="800">800 credits – $299</option>
              </select>

              <Button
                className="w-full bg-blue-600 text-white"
                onClick={() =>
                 redirectToCheckout(PAYG_PRICES[paygAmount as keyof typeof PAYG_PRICES], "payment")
                }
              >
                Buy now
              </Button>

              <p className="text-sm text-gray-600 mt-4">
                Pay only for what you use — no commitments. Credits expire after 30 days.
              </p>
            </CardContent>
          </Card>

          {/* SUBSCRIPTION CARD */}
          <Card className="border p-6 shadow-lg relative">
            <span className="absolute -top-3 right-3 bg-yellow-400 text-xs px-3 py-1 rounded-full font-semibold">
              Most Popular
            </span>

            <CardHeader>
              <h2 className="text-xl font-semibold mb-2">Pro Package ⚡</h2>
              <p className="text-gray-600 text-sm">
                Use up to <strong>50 credits</strong> per month
              </p>
            </CardHeader>

            <CardContent>
              <label className="block text-sm mb-2">Amount</label>

              <select
                value={subAmount}
                onChange={(e) => setSubAmount(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
              >
                <option value="50">50 credits – $9 / month</option>
                <option value="200">200 credits – $39 / month</option>
                <option value="500">500 credits – $79 / month</option>
                <option value="1000">1000 credits – $169 / month</option>
                <option value="2000">2000 credits – $299 / month</option>
                <option value="4000">4000 credits – $499 / month</option>
              </select>

              <Button
                className="w-full bg-blue-600 text-white"
                onClick={() =>
                redirectToCheckout(SUB_PRICES[subAmount as keyof typeof SUB_PRICES], "subscription")
                }
              >
                Subscribe
              </Button>

              <ul className="text-sm text-gray-700 mt-4 space-y-1">
                <li>● Removes Watermarks</li>
                <li>● Full HD Images</li>
                <li>● Best Value — Save Money</li>
                <li>● Cancel anytime</li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
