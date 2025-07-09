// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-kQodxj4m-19Iqf76Z-9d0nx04OPc1RM",
  authDomain: "accidentdb01.firebaseapp.com",
  projectId: "accidentdb01",
  storageBucket: "accidentdb01.firebasestorage.app",
  messagingSenderId: "866936542603",
  appId: "1:866936542603:web:acae9f165be86681e68b8e",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
