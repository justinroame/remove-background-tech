"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleBuyNow = async () => {
    if (!session?.user) return router.push("/auth/signup");

    // Call your Stripe checkout API
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ userId: session.user.id }),
    });

    const data = await res.json();
    if (data?.url) router.push(data.url);
  };

  const handleSubscribe = async () => {
    if (!session?.user) return router.push("/auth/signup");

    const res = await fetch("/api/stripe/subscribe", {
      method: "POST",
      body: JSON.stringify({ userId: session.user.id }),
    });

    const data = await res.json();
    if (data?.url) router.push(data.url);
  };

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">One-Time Purchase</h2>
          <button
            onClick={handleBuyNow}
            className="bg-black text-white py-2 px-4 rounded hover:opacity-80"
          >
            Buy Now
          </button>
        </div>

        <div className="border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          <button
            onClick={handleSubscribe}
            className="bg-black text-white py-2 px-4 rounded hover:opacity-80"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
