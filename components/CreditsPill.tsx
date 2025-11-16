"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);

  // Wait until auth status is known
  useEffect(() => {
    if (status !== "authenticated") {
      setCredits(0);
      return;
    }

    fetch("/api/credits/summary")
      .then((res) => res.json())
      .then((data) => {
        if (!data || typeof data.total !== "number") {
          setCredits(0); // fallback instead of crashing
        } else {
          setCredits(data.total);
        }
      })
      .catch(() => setCredits(0));
  }, [status]);

  if (credits === null) return null;

  return (
    <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm shadow">
      Credits: {credits}
    </div>
  );
}
