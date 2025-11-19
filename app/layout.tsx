import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientProviders from "@/components/ClientProviders";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "remove-background.tech",
  description: "AI Background Removal",
};

// ---- FIXED TYPE HERE ----
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <Header />
          <main className="pt-20">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
