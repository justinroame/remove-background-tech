// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientProviders from "@/components/ClientProviders";
import GlobalHeader from "@/components/GlobalHeader";

// Enable Vercel Analytics — this is the only new line you need
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remove Background from Image – Free AI Background Remover",
  description: "Instant free AI background remover. Upload an image and download a transparent PNG in seconds.",
  metadataBase: new URL("https://remove-background.tech"),
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <GlobalHeader />
          <main className="pt-20">{children}</main>
        </ClientProviders>

        {/* This single line turns on real-time + full analytics */}
        <Analytics />
      </body>
    </html>
  );
}