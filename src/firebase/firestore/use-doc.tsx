'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseDocOptions {
  snapshotListenOptions?: any;
}

export const useDoc = <T extends DocumentData>(
  ref: DocumentReference | null,
  options?: UseDocOptions
): { data: (T & { id: string }) | null; loading: boolean; error: Error | null } => {
  const db = useFirestore();
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !ref) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching document: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, ref?.path]);

  return { data, loading, error };
};
