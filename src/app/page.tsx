'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Icons } from '@/components/icons';

function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
      <Icons.logo className="h-24 w-24" />
      <h1 className="mt-6 font-headline text-5xl font-bold text-primary-foreground">IDA</h1>
      <p className="mt-2 text-lg text-muted-foreground">Your AI Health Ally</p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setIsSplashDone(true);
    }, 3000); // 3-second splash screen

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isClient && isSplashDone && !loading) {
      try {
        const languageSelected = localStorage.getItem('languageSelected');
        if (!languageSelected) {
          router.replace('/language-select');
          return;
        }

        const onboardingComplete = localStorage.getItem('onboardingComplete');
        if (onboardingComplete) {
          router.replace('/home');
        } else {
          router.replace('/onboarding');
        }
      } catch (e) {
        // Fallback for environments where localStorage is not available
        router.replace('/language-select');
      }
    }
  }, [isClient, isSplashDone, loading, router, user]);

  return <SplashScreen />;
}
