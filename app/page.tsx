'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Ruler } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Ruler className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Designer Measurement App</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}