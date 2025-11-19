// app/layout.tsx — CLEAN + CORRECT
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import GlobalHeader from "@/components/GlobalHeader"; // ← NEW

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "remove-background.tech",
  description: "AI Background Removal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <GlobalHeader />      {/* ONLY ONE HEADER IN THE WHOLE APP */}
          <main className="pt-20">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
