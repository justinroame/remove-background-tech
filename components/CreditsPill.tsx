// components/CreditsPill.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";

export default function CreditsPill() {
  const { user } = useUser();
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/credits/summary?_=" + Date.now(), { cache: "no-store" });
      const data = await res.json();
      if (data.total !== undefined) setCredits(data.total);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) {
      setCredits(null);
      return;
    }
    fetchCredits();

    const onCredits = () => fetchCredits();
    window.addEventListener("credits-updated", onCredits);
    return () => window.removeEventListener("credits-updated", onCredits);
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
      Credits: {credits === null ? "…" : credits}
    </div>
  );
}
