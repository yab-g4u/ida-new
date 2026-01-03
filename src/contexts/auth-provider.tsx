'use client';

import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth'; // Keep for type consistency if needed elsewhere
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

// Define a simple user object for our client-side auth
interface ClientUser {
  uid: string;
  displayName: string;
  isAnonymous: boolean;
}

interface AuthContextType {
  user: ClientUser | null;
  loading: boolean;
  userId: string | null;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/language-select', '/onboarding'];

function generateUniqueId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

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
      } else {
        // If no user, and onboarding is complete, create a new anonymous user.
        const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
        if (onboardingComplete) {
            const newUser: ClientUser = {
                uid: generateUniqueId(),
                displayName: 'User',
                isAnonymous: true,
            };
            localStorage.setItem('ida-user', JSON.stringify(newUser));
            setUser(newUser);
        }
      }
    } catch (e) {
      console.warn('Could not access localStorage for auth.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';
    
    // After onboarding is done, a user should have been created. If not, and they try to access a private route, send them back.
    if (!user && !isPublicRoute) {
        // If they haven't even selected a language, start from the beginning.
        if(localStorage.getItem('languageSelected') !== 'true') {
             router.push('/language-select');
        } else {
            // Otherwise, they might be on a private page without being "logged in".
            // For now, we'll let them through as the page will create a user,
            // but in a real app with login, you'd redirect.
            // router.push('/login');
        }
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
