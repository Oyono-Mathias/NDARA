/// <reference types="vite/client" />

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Avertissement propre si la configuration est absente, sans crasher l'application
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('votre_cle_api_ici')) {
  console.warn('⚠️ Configuration Firebase manquante ou placeholders détectés dans .env.');
}

// Initialisation sécurisée (évite les multi-initialisations en mode strict/HMR)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exports des services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
