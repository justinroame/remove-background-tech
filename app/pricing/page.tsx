"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

export const metadata = {
  title: "Background Remover Pricing – Credits & Pro Plans | remove-background.tech",
  description:
    "Simple and affordable pricing for removing backgrounds from images using AI. Buy credits or subscribe for high-volume editing. No hidden fees.",
  keywords: [
    "background remover pricing",
    "remove background pricing",
    "image credit pricing",
    "AI background remover",
    "remove background subscription",
    "image editing credits",
  ],
  alternates: {
    canonical: "https://remove-background.tech/pricing",
  },
  openGraph: {
    title: "Background Remover Pricing – Credits & Pro Plans",
    description: "Choose from pay-as-you-go image credits or Pro monthly plans. Perfect for product photos, e-commerce, and content creators.",
    url: "https://remove-background.tech/pricing",
    siteName: "remove-background.tech",
    images: [
      {
        url: "/og-pricing.jpg",
        width: 1200,
        height: 630,
        alt: "AI Background Removal Pricing",
      },
    ],
    type: "website",
  },
  robots: "index, follow",
};

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
