'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-provider';
import { Icons } from '@/components/icons';
import { signInAnonymously } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';

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
  const auth = useFirebaseAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !loading) {
      const handleAuthentication = async () => {
        if (!auth) return;

        if (user) {
          // User is already logged in (even anonymously)
          router.replace('/home');
        } else {
          // No user, sign in anonymously
          try {
            await signInAnonymously(auth);
            // The onAuthStateChanged listener in AuthProvider will handle the redirect
          } catch (error) {
            console.error('Anonymous sign-in failed:', error);
            // Handle error case, maybe show an error message
          }
        }
      };

      handleAuthentication();
    }
  }, [isClient, loading, user, auth, router]);

  return <SplashScreen />;
}
