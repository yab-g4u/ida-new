'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
        const languageSelected = localStorage.getItem('languageSelected') === 'true';
        
        if (onboardingComplete) {
          router.replace('/home');
        } else if (languageSelected) {
          router.replace('/onboarding');
        } else {
          router.replace('/language-select');
        }
      } catch (e) {
        console.warn('Could not access localStorage, defaulting to language select.');
        router.replace('/language-select');
      }
    }
  }, [router, isClient]);

  return <SplashScreen />;
}
