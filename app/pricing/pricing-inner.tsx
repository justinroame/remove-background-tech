"use client";

import { useUser } from "@/lib/useUser";
import Link from "next/link";

export default function PricingInner() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading pricing…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-8">Pricing</h1>

      {/* Logged OUT */}
      {!user && (
        <Link
          href="/auth/signup"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Create free account
        </Link>
      )}

      {/* Logged IN */}
      {user && (
        <div className="space-y-10">
          <div className="text-lg">
            You have{" "}
            <span className="font-semibold">
              {user.totalCredits}
            </span>{" "}
            credits
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Credits */}
            <div className="border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">
                Pay per credit
              </h2>
              <p className="mb-4 text-gray-600">
                Buy credits as you need them
              </p>
              <Link
                href="/pricing#credits"
                className="inline-block bg-black text-white px-5 py-2 rounded"
              >
                Buy credits
              </Link>
            </div>

            {/* Subscription */}
            <div className="border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">
                Pro subscription
              </h2>
              <p className="mb-4 text-gray-600">
                Unlimited background removals
              </p>
              <Link
                href="/pricing#pro"
                className="inline-block bg-blue-600 text-white px-5 py-2 rounded"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
