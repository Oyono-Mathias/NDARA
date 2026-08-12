import { adminDb } from './src/lib/firebaseAdmin';

async function test() {
    try {
        const snapshot = await adminDb.collection('users').limit(1).get();
        console.log("Success:", snapshot.size);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
