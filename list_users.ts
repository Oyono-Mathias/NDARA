import { adminDb } from './src/lib/firebaseAdmin';

async function listUsers() {
  const users = await adminDb.collection('users').get();
  console.log(`Found ${users.size} users`);
  users.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}

listUsers().catch(console.error);
