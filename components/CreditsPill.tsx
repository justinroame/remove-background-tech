"use client";

import { useEffect, useState } from "react";

export default function CreditsPill() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/credits/summary")
      .then((res) => res.json())
      .then((data) => setCredits(data.total))
      .catch(() => setCredits(0));
  }, []);

  if (credits === null) return null;

  return (
    <div className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm shadow">
      Credits: {credits}
    </div>
  );
}
