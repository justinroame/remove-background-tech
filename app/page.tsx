'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/remove');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading your AI tool...</p>
    </div>
  );
}
