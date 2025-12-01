'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '../provider';

export const useUser = (): { user: User | null; loading: boolean } => {
  const auth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
};
