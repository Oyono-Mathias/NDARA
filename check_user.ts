import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function run() {
  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.where('email', '==', 'oyonomathias@gmail.com').get();
  if (!snapshot.empty) {
    const user = snapshot.docs[0].data();
    console.log("User role:", user.role);
  }
}
run().catch(console.error).finally(() => process.exit(0));
