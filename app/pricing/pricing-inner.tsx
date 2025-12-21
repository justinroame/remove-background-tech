"use client";

import { useUser } from "@/lib/useUser";
import Link from "next/link";

export default function PricingInner() {
  const { user } = useUser();

  return (
    <div className="max-w-4xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Pricing</h1>

      {!user && (
        <Link
          href="/auth/signup"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Create free account
        </Link>
      )}
    </div>
  );
}
