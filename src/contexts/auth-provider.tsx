'use client';

import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userId: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/language-select', '/onboarding'];

function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
      <Icons.logo className="h-24 w-24" />
      <h1 className="mt-6 font-headline text-5xl font-bold text-foreground">IDA</h1>
      <p className="mt-2 text-lg text-muted-foreground">Your AI Health Ally</p>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const auth = useFirebaseAuth();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    };
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If no user, automatically sign in anonymously
        try {
          const userCredential = await signInAnonymously(auth);
          setUser(userCredential.user);
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return; 

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';

    // With anonymous auth, users are almost always "logged in"
    // So the primary check is for whether we are on a public setup route.
    // If we have a user and we are on a setup route, go home.
    if (user && isPublicRoute) {
        router.push('/home');
    }

  }, [loading, user, pathname, router]);

  const signOut = async () => {
    if (!auth) return;
    // For anonymous auth, we might just clear state rather than sign out
    // But for now, standard sign out is fine. A new anonymous user will be created on next load.
    await auth.signOut();
    setUser(null);
    router.push('/'); // Go to root to restart the auth flow
  };

  const value = useMemo(() => ({
    user,
    loading,
    userId: user?.uid || null,
    signOut
  }), [user, loading, signOut]);

  if (loading) {
      return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
