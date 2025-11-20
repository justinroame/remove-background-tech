// app/pricing/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const PricingInner = dynamic(() => import("./pricing-inner"), {
  ssr: false,
});

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <PricingInner />
    </Suspense>
  );
}
