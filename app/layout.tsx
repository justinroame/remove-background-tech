// app/layout.tsx — FINAL
import "./globals.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import GlobalHeader from "@/components/GlobalHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "remove-background.tech",
  description: "AI Background Removal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
          <GlobalHeader />
          <main className="pt-20">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
