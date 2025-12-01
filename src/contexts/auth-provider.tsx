'use client';

import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Icons } from '@/components/icons';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userId: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/language-select', '/onboarding'];

function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
      <Icons.logo className="h-24 w-24" />
      <h1 className="mt-6 font-headline text-5xl font-bold text-primary-foreground">IDA</h1>
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
      setLoading(false); // If no auth, stop loading
      return;
    };
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (loading) return; // Don't do anything while loading
    
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';

    if (!user && !isPublicRoute) {
        router.push('/login');
    }
  }, [loading, user, pathname, router]);

  const signOut = async () => {
    if (!auth) return;
    await auth.signOut();
    setUser(null);
    router.push('/login');
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
