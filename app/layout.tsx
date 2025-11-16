import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic"; // ← REQUIRED IMPORT

// Dynamically load CreditsPill on the client only
const CreditsPill = dynamic(() => import("@/components/CreditsPill"), {
  ssr: false,
  loading: () => <div className="w-24 h-9" />, // tiny placeholder
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "remove-background.tech - AI Background Removal",
  description: "Remove backgrounds from images automatically with AI.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <header className="w-full flex justify-end p-4">
          <CreditsPill />
        </header>

        {children}
        <Analytics />
      </body>
    </html>
  );
}
