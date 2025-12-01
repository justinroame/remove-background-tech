// components/CreditsPill.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/credits/summary?_=" + Date.now(), {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.total !== undefined) setCredits(data.total);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCredits();
      const interval = setInterval(fetchCredits, 3000);
      return () => clearInterval(interval);
    }
  }, [session?.user]);

  if (!session?.user || credits === null) {
    return (
      <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
        Credits: …
      </div>
    );
  }

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
      Credits: {credits}
    </div>
  );
}