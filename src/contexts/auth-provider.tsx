'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userId: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/language-select', '/onboarding', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
        router.push('/login');
    }
  }, [loading, user, pathname, router])

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const value = useMemo(() => ({
    user,
    loading,
    userId: user?.uid || null,
    signOut
  }), [user, loading]);

  if (loading && !publicRoutes.includes(pathname)) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
            <p>Loading...</p>
        </div>
      )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
