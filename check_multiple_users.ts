import { admin, adminDb } from './src/lib/firebaseAdmin.js';
async function run() {
  const docs = await adminDb.collection('users').where('email', '==', 'oyonomathias@gmail.com').get();
  console.log("Found", docs.size, "users with email oyonomathias@gmail.com");
  docs.forEach(d => console.log("User doc ID:", d.id, d.data().role));
}
run();
