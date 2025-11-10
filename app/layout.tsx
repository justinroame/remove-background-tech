// app/layout.tsx
// CACHE BUST: 2025-11-10-1000
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Remove Background Tech",
  description: "Remove image backgrounds instantly online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 Forum: **Fixed missing type annotation**  
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
