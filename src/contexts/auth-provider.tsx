'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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
  const auth = useFirebaseAuth();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
        router.push('/login');
    }
  }, [loading, user, pathname, router])

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

  if (loading && !publicRoutes.includes(pathname)) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
