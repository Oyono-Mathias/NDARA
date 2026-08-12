import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp({ projectId: 'ai-studio-ndaraafrique' });
const db = getFirestore(admin.app(), 'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008');

async function run() {
    try {
        const snap = await db.collection('users').limit(1).get();
        console.log("Success!", snap.size);
    } catch(e) {
        console.log("Failed:", e.message);
    }
}
run();
