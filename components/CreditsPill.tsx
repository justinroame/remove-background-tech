"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  async function refreshCredits() {
    try {
      const res = await fetch("/api/credits/summary?t=" + Date.now(), {
        cache: "no-store",           // ← disables all caching
        next: { revalidate: 0 },     // ← forces fresh data on every request
      });
      const data = await res.json();
      if (res.ok && data.total !== undefined) {
        setCredits(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) refreshCredits();
  }, [session?.user]);

  // Refresh when anyone adds credits (admin or download)
  useEffect(() => {
    const handler = () => refreshCredits();
    window.addEventListener("credits-updated", handler);
    window.addEventListener("focus", refreshCredits); // also refresh when tab gets focus
    return () => {
      window.removeEventListener("credits-updated", handler);
      window.removeEventListener("focus", refreshCredits);
    };
  }, []);

  if (!session?.user) return null;

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm shadow-md">
      <span className="font-semibold">Credits:</span>{" "}
      {loading ? "…" : credits}
    </div>
  );
}