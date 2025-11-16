import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";   // ← ADD THIS

const inter = Inter({ subsets: ["latin"] });

// Dynamic import + ssr: false so it doesn't crash on first render
const CreditsPill = dynamic(() => import("@/components/CreditsPill"), {
  ssr: false,
  loading: () => <div className="w-24 h-9" />,
});

export const metadata = {
  title: "remove-background.tech - AI Background Removal",
  description: "Remove backgrounds from images automatically with AI.",
  // your icons...
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* This is REQUIRED for useSession() to work anywhere */}
        <SessionProvider>
          <header className="w-full flex justify-end p-4">
            <CreditsPill />
          </header>
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}