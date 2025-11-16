import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import dynamic from "next/dynamic";
import CreditsPill from "../components/CreditsPill";

const DynamicCreditsPill = dynamic(() => Promise.resolve(CreditsPill), {
  ssr: false,
  loading: () => <div className="w-24 h-9" />,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "remove-background.tech - AI Background Removal",
  description: "Remove backgrounds from images automatically with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;        // ← FIXED
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <header className="w-full flex justify-end p-4">
          <DynamicCreditsPill />
        </header>

        {children}

        <Analytics />
      </body>
    </html>
  );
}
