import { adminDb, admin } from './src/lib/firebaseAdmin.ts';

async function run() {
  const usersRef = adminDb.collection("users");
  const snap = await usersRef.limit(1).get();
  console.log("Users:", snap.size);
}
run().catch(console.error);
