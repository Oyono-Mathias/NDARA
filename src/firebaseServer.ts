/**
 * Configuration Firebase côté serveur (Node.js / Cloud Functions).
 * 
 * Note : Le package 'firebase-admin' n'est pas inclus dans le bundle frontend.
 * Ce fichier prépare l'architecture pour les Cloud Functions futures
 * sans polluer le client avec des clés privées, tout en conservant le typage TS.
 */

export interface FirebaseAdminApp {
  name: string;
}

/**
 * Initialise l'application Firebase Admin de manière sûre (évite les duplications).
 */
export const initFirebaseAdmin = (): FirebaseAdminApp | null => {
  console.info("L'initialisation Firebase Admin sera implémentée lors de la phase backend via le SDK 'firebase-admin'.");
  return null;
};

/**
 * Accès sécurisé à Firestore côté serveur.
 */
export const getAdminDb = (): any => {
  throw new Error("L'accès serveur nécessite l'environnement Cloud Functions.");
};

/**
 * Accès sécurisé à l'Auth côté serveur.
 */
export const getAdminAuth = (): any => {
  throw new Error("L'accès serveur nécessite l'environnement Cloud Functions.");
};
