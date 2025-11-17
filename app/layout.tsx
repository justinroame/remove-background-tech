// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// IMPORTANT: dynamically import SessionProvider (client only)
const ClientSessionProvider = dynamic(
  () => import("@/components/ClientSessionProvider"),
  { ssr: false }
);

const ClientProviders = dynamic(() => import("@/components/ClientProviders"), {
  ssr: false,
});

export const metadata: Metadata = {
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
        <ClientSessionProvider>
          <ClientProviders>{children}</ClientProviders>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
