// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Remove Background - Free AI Tool',
  description: 'Instant background removal. Free for 5 images/month.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Header – EXACT remove.bg */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-gray-900">remove.bg</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Log in</a>
              <a href="#" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Sign up</a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        {/* Footer – EXACT remove.bg */}
        <footer className="bg-white border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
            © 2025 remove.bg. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
