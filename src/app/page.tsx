'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import { Icons } from '@/components/icons';

function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
      <Icons.logo className="h-24 w-24" />
      <h1 className="mt-6 font-headline text-5xl font-bold text-foreground">IDA</h1>
      <p className="mt-2 text-lg text-muted-foreground">Your AI Health Ally</p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/language-select');
      }
    }
  }, [loading, user, router]);

  return <SplashScreen />;
}
