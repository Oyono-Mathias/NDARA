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
    console.error("Could not read firebase-applet-config.json", e);
}

if (!admin.apps.length) {
    admin.initializeApp({
        projectId
    });
}

const app = admin.app();
export const adminDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const adminStorage = admin.storage();
export { admin };
