import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import dynamic from "next/dynamic";

// This prevents the component from loading until the client is ready
const CreditsPill = dynamic(() => import("@/components/CreditsPill"), {
  ssr: false,        // Don't render on server
  loading: () => <div className="w-24 h-9" />, // optional placeholder
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = { /* your metadata */ };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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