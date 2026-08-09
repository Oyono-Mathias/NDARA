import { adminDb } from './src/lib/firebaseAdmin.js';
async function test() {
  try {
    const snap = await adminDb.collection('users').limit(1).get();
    console.log('Success, found users:', snap.size);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
