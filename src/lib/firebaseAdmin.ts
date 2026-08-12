import { logger } from '../lib/logger.js';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'demo-project';
let databaseId = undefined;

try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        projectId = config.projectId || projectId;
        databaseId = config.firestoreDatabaseId;
    }
} catch (e) {
    logger.error("Could not read firebase-applet-config.json", e);
}

let isInitialized = false;

function ensureInitialized() {
    if (isInitialized) return;
    
    // Fallback to ADC if no FIREBASE_SERVICE_ACCOUNT is provided.
    // This allows testing if the user decides to configure IAM directly.
    let credential = admin.credential.applicationDefault();

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
            logger.info("Firebase Admin initialized via Service Account JSON secret.");
        } catch (e) {
            logger.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", e);
            throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON. It must be a valid Service Account JSON string.");
        }
    } else {
        logger.info("No FIREBASE_SERVICE_ACCOUNT found. Falling back to Application Default Credentials.");
    }
    
    if (!admin.apps.length) {
        admin.initializeApp({ 
            projectId,
            credential
        });
    }
    
    isInitialized = true;
}

export const adminDb = new Proxy({}, {
    get(target, prop) {
        ensureInitialized();
        const app = admin.app();
        const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
        const val = Reflect.get(db, prop);
        return typeof val === 'function' ? val.bind(db) : val;
    }
}) as admin.firestore.Firestore;

export const adminStorage = new Proxy({}, {
    get(target, prop) {
        ensureInitialized();
        const storage = admin.storage();
        const val = Reflect.get(storage, prop);
        return typeof val === 'function' ? val.bind(storage) : val;
    }
}) as admin.storage.Storage;

export const adminAuth = new Proxy({}, {
    get(target, prop) {
        ensureInitialized();
        const auth = admin.auth();
        const val = Reflect.get(auth, prop);
        return typeof val === 'function' ? val.bind(auth) : val;
    }
}) as admin.auth.Auth;

// Export the native admin object directly.
export { admin };
