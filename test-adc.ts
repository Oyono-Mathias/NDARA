import { adminDb, admin } from './src/lib/firebaseAdmin.js';
async function test() {
  try {
    const res = await adminDb.collection('test').add({ ok: true });
    console.log('Success:', res.id);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
