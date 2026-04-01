"use client";

import { useMemo, useState } from "react";

type CreditOption = { credits: number; label: string; priceLabel: string };

const CREDIT_OPTIONS: CreditOption[] = [
  { credits: 5, label: "5 credits", priceLabel: "$3" },
  { credits: 15, label: "15 credits", priceLabel: "$9" },
  { credits: 50, label: "50 credits", priceLabel: "$26" },
  { credits: 100, label: "100 credits", priceLabel: "$45" },
  { credits: 400, label: "400 credits", priceLabel: "$169" },
  { credits: 800, label: "800 credits", priceLabel: "$299" },
];

export default function PricingInner() {
  const [selectedCredits, setSelectedCredits] = useState<number>(CREDIT_OPTIONS[1].credits);
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => CREDIT_OPTIONS.find((o) => o.credits === selectedCredits) ?? CREDIT_OPTIONS[0],
    [selectedCredits]
  );

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: selectedCredits, mode: "payment" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        alert(data?.error || "Unable to create checkout session");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-12">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Buy Credits</h1>
          <p className="mt-2 text-slate-600">Choose a credit pack and checkout instantly. No subscription.</p>

          <div className="mt-8 space-y-3">
            <label htmlFor="credit-pack" className="block text-sm font-medium text-slate-700">Credit package</label>
            <select
              id="credit-pack"
              value={selectedCredits}
              onChange={(e) => setSelectedCredits(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {CREDIT_OPTIONS.map((option) => (
                <option key={option.credits} value={option.credits}>
                  {option.label} — {option.priceLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 border border-slate-200">
            <p className="text-sm text-slate-500">Selected package</p>
            <p className="text-xl font-semibold text-slate-900">
              {selected.label} <span className="text-blue-600">({selected.priceLabel})</span>
            </p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Continue to secure checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
