// components/ClientProviders.tsx
"use client";

import useFreeDownloadRedirect from "@/hooks/useFreeDownloadRedirect";
import { UserProvider } from "@/components/UserProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useFreeDownloadRedirect();
  return <UserProvider>{children}</UserProvider>;
}
