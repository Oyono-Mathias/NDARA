import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "gen-lang-client-0381307586"
});
const db = getFirestore(admin.app(), "ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008");
async function test() {
  try {
    const res = await db.collection('test').add({ ok: true });
    console.log('Success:', res.id);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
