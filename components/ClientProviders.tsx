// components/ClientProviders.tsx
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <SessionStabilizer>{children}</SessionStabilizer>
    </SessionProvider>
  );
}

/**
 * Prevents flashing header by:
 * - forcing a session refresh once
 * - delaying render until session is stabilized
 */
function SessionStabilizer({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // refresh session 1 time on first load to eliminate flicker
    update().finally(() => setReady(true));
  }, [update]);

  // while loading — show nothing (prevents layout flicker)
  if (!ready || status === "loading") {
    return null;
  }

  return <>{children}</>;
}
