// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtKas2Q9pV48iKFAwcPiktUTdY6mgskEE",
  authDomain: "cozy-a2fbf.firebaseapp.com",
  databaseURL: "https://cozy-a2fbf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cozy-a2fbf",
  storageBucket: "cozy-a2fbf.appspot.com",
  messagingSenderId: "232046779269",
  appId: "1:232046779269:web:cfe90b74e33bc8db6a42ec",
  measurementId: "G-J9PXJZ5M9Z"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
