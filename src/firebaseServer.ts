import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const serverApp = initializeApp(firebaseConfig);
export const serverDb = getFirestore(serverApp, firebaseConfig.firestoreDatabaseId);
