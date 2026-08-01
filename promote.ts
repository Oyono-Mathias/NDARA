import { adminDb } from './src/lib/firebaseAdmin';

async function promote() {
  const users = await adminDb.collection('users').where('email', '==', 'oyonomathias@gmail.com').get();
  if (users.empty) {
    console.log('User not found in DB');
    return;
  }
  for (const doc of users.docs) {
    await doc.ref.update({ role: 'admin' });
    console.log(`Promoted user ${doc.id} to admin`);
  }
}
promote().catch(console.error);
