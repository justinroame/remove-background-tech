"use client";

import { useUser } from "@/lib/useUser";

export default function CreditsPill() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
      Credits: {user.totalCredits}
    </div>
  );
}
