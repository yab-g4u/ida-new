'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
  query,
  where,
  collectionGroup,
  orderBy,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseCollectionOptions {
  idField?: string;
  snapshotListenOptions?: any;
}

export const useCollection = <T extends DocumentData>(
  q: Query | null,
  options?: UseCollectionOptions
): { data: (T & { id: string })[] | null; loading: boolean; error: Error | null } => {
  const db = useFirestore();
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !q) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: options?.idField ? doc.get(options.idField) : doc.id,
            } as T & { id: string })
        );
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching collection: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, q ? JSON.stringify(q) : null, options?.idField]); // Use JSON.stringify to create a stable dependency

  return { data, loading, error };
};
