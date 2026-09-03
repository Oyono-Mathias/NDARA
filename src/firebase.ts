/// <reference types="vite/client" />

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialisation sécurisée (évite les multi-initialisations en mode strict/HMR)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exports des services
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
