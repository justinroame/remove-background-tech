"use client";

import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-24 h-9" />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm shadow-md">
      <span className="font-semibold">Credits:</span> {session.user.credits ?? 0}
    </div>
  );
}
