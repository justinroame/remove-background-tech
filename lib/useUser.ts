// lib/useUser.ts
"use client";

import { useCallback, useEffect, useState } from "react";

export type AppUser = {
  id: string;
  email: string;
  totalCredits: number;
  pro: boolean;
};

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me?_=" + Date.now(), { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setUser(null);
      // let other components refetch if they want
      window.dispatchEvent(new Event("auth-changed"));
    }
  }, []);

  useEffect(() => {
    refresh();

    const onAuth = () => refresh();
    window.addEventListener("auth-changed", onAuth);
    return () => window.removeEventListener("auth-changed", onAuth);
  }, [refresh]);

  return { user, loading, refresh, logout };
}
