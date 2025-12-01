'use client';
import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  app: FirebaseApp | undefined;
  auth: Auth | undefined;
  db: Firestore | undefined;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: undefined,
  auth: undefined,
  db: undefined,
});

export const FirebaseProvider: React.FC<{
  children: React.ReactNode;
  value: FirebaseContextType;
}> = ({ children, value }) => (
  <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
);

export const useFirebaseApp = () => useContext(FirebaseContext)?.app;
export const useAuth = () => useContext(FirebaseContext)?.auth;
export const useFirestore = () => useContext(FirebaseContext)?.db;
