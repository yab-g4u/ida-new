'use client';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Re-export hooks and providers
export { FirebaseProvider, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
  // This check is important to avoid re-initializing the app on every render.
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } else {
      app = getApp();
      auth = getAuth(app);
      db = getFirestore(app);
    }
  }
  return { app, auth, db };
}

export { initializeFirebase };
