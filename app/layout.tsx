import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

// 1. Normal import (this works reliably with TypeScript + @ alias)
import CreditsPill from "@/components/CreditsPill";

// 2. Wrap it in dynamic + ssr:false so it never runs on the server
const DynamicCreditsPill = dynamic(
  () => Promise.resolve(CreditsPill),   // this bypasses the import() type issue
  {
    ssr: false,
    loading: () => <div className="w-24 h-9" />, // optional placeholder
  }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "remove-background.tech - AI Background Removal",
  description: "Remove backgrounds from images automatically with AI.",
  // …your icons etc.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* This is REQUIRED for useSession() to ever work */}
        <SessionProvider>
          <header className="w-full flex justify-end p-4">
            <DynamicCreditsPill />
          </header>

          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}