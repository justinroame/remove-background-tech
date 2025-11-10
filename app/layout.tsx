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
        {/* Header - Like remove.bg */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="text-2xl font-bold text-gray-900">remove.bg</div>
            {/* Menu */}
            <nav className="hidden md:flex space-x-6">
              <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/login" className="text-gray-600 hover:text-gray-900">Log in</a>
              <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Sign up</a>
            </nav>
          </div>
        </header>

        <main>
          {children}
        </main>

        {/* Footer - Simple */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-16 py-8">
          <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
            © 2025 remove.bg. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
