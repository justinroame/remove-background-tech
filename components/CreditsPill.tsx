"use client";

import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session, status } = useSession();

  // While session is loading, avoid hydration mismatches
  if (status === "loading") {
    return <div className="w-24 h-9" />;
  }

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm shadow-sm">
      {session ? (
        <>
          <span className="font-semibold">Credits:</span>{" "}
          {session.user?.credits ?? 0}
        </>
      ) : (
        "Not logged in"
      )}
    </div>
  );
}
