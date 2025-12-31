"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";

export default function CreditsPill() {
  const { user, loading } = useUser();
  const [credits, setCredits] = useState<number | null>(null);

  async function fetchCredits() {
    try {
      const res = await fetch("/api/credits/me", {
        cache: "no-store",
      });

      if (!res.ok) {
        setCredits(0);
        return;
      }

      const data = await res.json();
      setCredits(typeof data.credits === "number" ? data.credits : 0);
    } catch (err) {
      console.error("Failed to fetch credits", err);
      setCredits(0);
    }
  }

  useEffect(() => {
    // wait until user hydration completes
    if (loading) return;

    if (!user) {
      setCredits(null);
      return;
    }

    fetchCredits();

    const onCreditsUpdated = () => fetchCredits();
    window.addEventListener("credits-updated", onCreditsUpdated);

    return () => {
      window.removeEventListener("credits-updated", onCreditsUpdated);
    };
  }, [user, loading]);

  if (!user) return null;

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
      Credits: {credits === null ? "…" : credits}
    </div>
  );
}
