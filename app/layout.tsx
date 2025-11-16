"use client";

import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";   // ✅ FIX
import CreditsPill from "@/components/CreditsPill";   // uses useSession()

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "remove-background.tech - AI Background Removal",
  description: "Remove backgrounds from images automatically with AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        
        {/* 🔥 MUST WRAP THE APP OR useSession() WILL BREAK */}
        <SessionProvider>
          <header className="w-full flex justify-end p-4">
            <CreditsPill />
          </header>

          {children}
        </SessionProvider>

        <Analytics />
      </body>
    </html>
  );
}
