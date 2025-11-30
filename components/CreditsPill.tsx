"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function CreditsPill() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  async function refreshCredits() {
    try {
      const res = await fetch("/api/credits/summary", {
        cache: "no-store",
        headers: { "X-Force-Refresh": "1" }, // bypass any cache
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

  // This catches the admin header AND download events
  useEffect(() => {
    const handler = () => {
      setLoading(true);
      refreshCredits();
    };
    window.addEventListener("credits-updated", handler);
    return () => window.removeEventListener("credits-updated", handler);
  }, []);

  if (!session?.user) return null;

  return (
    <div className="bg-black text-white px-4 py-2 rounded-full text-sm shadow-md">
      <span className="font-semibold">Credits:</span> {loading ? "…" : credits}
    </div>
  );
}