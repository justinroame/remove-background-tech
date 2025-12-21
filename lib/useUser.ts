"use client";

import { useEffect, useState } from "react";

export type User = {
  id: string;
  email: string;
  totalCredits: number;
  pro: boolean;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        setUser(data?.user ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { user, loading };
}
