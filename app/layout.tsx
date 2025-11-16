import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// Correct dynamic import — TSX EXTENSION **NOT INCLUDED**
const ClientProviders = dynamic(() => import("../components/ClientProviders"), {
  ssr: false,
});

export const metadata = {
  title: "remove-background.tech - AI Background Removal",
  description: "Remove backgrounds from images automatically with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
