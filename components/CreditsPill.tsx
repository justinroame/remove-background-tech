// components/CreditsPill.tsx
"use client";

import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session, status } = useSession();

  // Still loading session → reserve space but show nothing
  if (status === "loading") {
    return <div className="w-24 h-9" />;
  }

  // Not logged in → hide completely
  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm shadow-md">
      <span className="font-semibold">Credits:</span>{" "}
      {session.user.credits ?? 0}
    </div>
  );
}
