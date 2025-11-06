'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/remove');  // Redirect to upload page
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading your AI tool...</p>  // Fallback during redirect
    </div>
  );
}
