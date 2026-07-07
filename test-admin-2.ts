import { adminDb } from './src/lib/firebaseAdmin';

async function test() {
  try {
    const snap = await adminDb.collection('settings').limit(1).get();
    console.log("Docs:", snap.docs.length);
  } catch (e) {
    console.error(e);
  }
}
test();
