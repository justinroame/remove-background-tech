// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import GlobalHeader from "@/components/GlobalHeader";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remove Background from Image – Free AI Background Remover",
  description:
    "Instant free AI background remover. Upload an image and download a transparent PNG in seconds.",
  metadataBase: new URL("https://remove-background.tech"),
  robots: "index, follow",
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
