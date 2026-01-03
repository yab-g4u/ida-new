'use client';

import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

// Define a simple user object for our client-side auth
export interface ClientUser {
  uid: string;
  displayName: string;
  isAnonymous: boolean;
}

interface AuthContextType {
  user: ClientUser | null;
  loading: boolean;
  userId: string | null;
  signOut: () => void;
  setUser: (user: ClientUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/language-select', '/onboarding', '/create-user'];


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
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs only once on the client to initialize auth state
    try {
      const storedUser = localStorage.getItem('ida-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Could not access localStorage for auth.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';
    
    // If there's no user and they are trying to access a private route, send them to the beginning of the flow.
    if (!user && !isPublicRoute) {
        router.push('/language-select');
    }

  }, [loading, user, pathname, router]);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem('ida-user');
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('languageSelected');
    } catch (e) {
      console.warn('Could not clear localStorage on sign out.');
    }
    setUser(null);
    router.push('/language-select');
  }, [router]);

  const value = useMemo(() => ({
    user,
    loading,
    userId: user?.uid || null,
    signOut,
    setUser,
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
