// app/pricing/page.tsx
"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { Suspense } from "react";
import PricingInner from "./pricing-inner";

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading pricing…</div>}>
      <PricingInner />
    </Suspense>
  );
}
