import fs from 'fs';
import path from 'path';

async function test() {
    const { adminDb } = await import('./src/lib/firebaseAdmin.js');
    try {
        const snap = await adminDb.collection('users').limit(1).get();
        console.log("Firestore success! Docs count:", snap.size);
    } catch (e) {
        console.error("Firestore error:", e);
    }
}
test();
