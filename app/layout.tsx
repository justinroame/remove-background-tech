// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import GlobalHeader from "@/components/GlobalHeader";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remove Background from Image | Transparent PNG for Product Photos, Logos, and More",
  description:
    "Remove backgrounds from images online and download a clean transparent PNG in seconds. Great for product photos, logos, ecommerce listings, and quick edits.",
  metadataBase: new URL("https://remove-background.tech"),
  robots: "index, follow",
  openGraph: {
    title: "Remove Background from Image | Transparent PNG in Seconds",
    description:
      "Remove backgrounds from images online for product photos, logos, transparent PNGs, and fast ecommerce image cleanup.",
    url: "https://remove-background.tech",
    siteName: "Remove Background Tech",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Background from Image | Transparent PNG in Seconds",
    description:
      "Fast online background removal for product photos, logos, and transparent PNGs.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* GOOGLE ADS CONVERSION TAG */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-1002767964"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-1002767964');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <GlobalHeader />
          <main className="pt-20">{children}</main>
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
