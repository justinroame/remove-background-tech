// app/pricing/page.tsx
"use client";

import { Suspense } from "react";
import PricingInner from "./pricing-inner";

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <PricingInner />
    </Suspense>
  );
}