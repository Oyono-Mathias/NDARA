import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "gen-lang-client-0381307586"
});
const db = getFirestore(admin.app());
async function test() {
  try {
    const res = await db.collection('test').add({ ok: true });
    console.log('Success:', res.id);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
