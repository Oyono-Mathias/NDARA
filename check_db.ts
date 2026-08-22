import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function run() {
  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.where('email', '==', 'oyonomathias@gmail.com').get();
  let userPhone = null;
  let userId = null;
  if (snapshot.empty) {
    console.log("User not found");
  } else {
    const user = snapshot.docs[0].data();
    userId = snapshot.docs[0].id;
    userPhone = user.phone;
    console.log("User found:", user.email, userPhone, userId);
  }

  const coursesRef = adminDb.collection('courses');
  const cSnap = await coursesRef.limit(5).get();
  cSnap.forEach(doc => {
    console.log("Course:", doc.id, doc.data().title, doc.data().price);
  });
}
run().catch(console.error).finally(() => process.exit(0));
