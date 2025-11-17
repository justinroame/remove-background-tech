// components/CreditsPill.tsx
"use client";

import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm shadow-md">
      <span className="font-semibold">Credits:</span>{" "}
      {session.user.totalCredits ?? 0}
    </div>
  );
}
