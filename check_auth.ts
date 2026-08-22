import { admin, adminDb } from './src/lib/firebaseAdmin.js';
async function run() {
  const user = await admin.auth().getUserByEmail('oyonomathias@gmail.com');
  console.log("Auth UID:", user.uid);
  
  const docs = await adminDb.collection('users').where('email', '==', 'oyonomathias@gmail.com').get();
  docs.forEach(d => console.log("User doc ID:", d.id, d.data().role));
}
run();
