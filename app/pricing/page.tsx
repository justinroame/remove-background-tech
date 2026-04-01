import { Suspense } from "react";
import PricingInner from "./pricing-inner";

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading pricing…</div>}>
      <PricingInner />
    </Suspense>
  );
}
