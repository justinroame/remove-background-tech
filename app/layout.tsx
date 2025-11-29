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
  description: "Instant free AI background remover. Upload an image and download a transparent PNG in seconds.",
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
        {/* GOOGLE ADS CONVERSION TAG — PASTE YOURS BELOW THIS LINE */}
        {/* ←←← REPLACE EVERYTHING BELOW WITH THE CODE FROM GOOGLE ADS ←←← */}
        {/* Google tag (gtag.js) */}
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
        {/* ←←← END OF GOOGLE TAG — DO NOT DELETE THE LINE ABOVE ←←← */}
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