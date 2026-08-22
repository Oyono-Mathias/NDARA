import { adminDb, admin } from './src/lib/firebaseAdmin.js';

async function run() {
  const user = await admin.auth().getUserByEmail('oyonomathias@gmail.com');
  console.log("Admin UID:", user.uid);
  
  const userDoc = await adminDb.collection('users').doc(user.uid).get();
  console.log("User role:", userDoc.data()?.role);
}
run();
