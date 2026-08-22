import { adminDb } from './src/lib/firebaseAdmin.js';
async function run() {
  const doc = await adminDb.collection('users').doc('G3sMbZuAILNm9zAq7zXPHcabK5n2').get();
  console.log(doc.data());
}
run();
