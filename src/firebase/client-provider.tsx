'use client';
import React from 'react';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { app, auth, db } = initializeFirebase();
  return <FirebaseProvider value={{ app, auth, db }}>{children}</FirebaseProvider>;
}
