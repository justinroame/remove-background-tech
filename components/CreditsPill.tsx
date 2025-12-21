"use client";

import { useUser } from "@/lib/useUser";

export default function CreditsPill() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm">
      {user.totalCredits} credits
    </div>
  );
}
