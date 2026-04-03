"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type AppUser = {
  id: string;
  email: string;
  totalCredits: number;
  pro: boolean;
};

type UserContextValue = {
  user: AppUser | null;
  loading: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true);

    try {
      const res = await fetch(`/api/me?_=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      setUser(data?.user ?? null);
    } catch {
      setUser((currentUser) => currentUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setUser(null);
      window.dispatchEvent(new Event("auth-changed"));
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onRefresh = () => {
      void refresh({ silent: true });
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh({ silent: true });
      }
    };

    window.addEventListener("auth-changed", onRefresh);
    window.addEventListener("credits-updated", onRefresh);
    window.addEventListener("focus", onRefresh);
    window.addEventListener("pageshow", onRefresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("auth-changed", onRefresh);
      window.removeEventListener("credits-updated", onRefresh);
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener("pageshow", onRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return <UserContext.Provider value={{ user, loading, refresh, logout }}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider.");
  }

  return context;
}
