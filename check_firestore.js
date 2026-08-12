import 'dotenv/config';
import { adminDb } from './src/lib/firebaseAdmin.ts';

async function check() {
  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.orderBy('createdAt', 'desc').limit(1).get();
  if (snapshot.empty) {
    console.log("No users found");
    return;
  }
  const user = snapshot.docs[0].data();
  console.log("Found newest user:", user.email);
  console.log("Role:", user.role);
  console.log("Has createdAt:", !!user.createdAt);
  console.log("Has lastLoginAt:", !!user.lastLoginAt);
  process.exit(0);
}
check().catch(console.error);
