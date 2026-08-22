const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function run() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', 'oyonomathias@gmail.com').get();
  if (snapshot.empty) {
    console.log("User not found");
  } else {
    const user = snapshot.docs[0].data();
    console.log("User found:", user.email, user.phone, user.uid || snapshot.docs[0].id);
  }

  const coursesRef = db.collection('courses');
  const cSnap = await coursesRef.limit(5).get();
  cSnap.forEach(doc => {
    console.log("Course:", doc.id, doc.data().title, doc.data().price);
  });
}

run().catch(console.error).finally(() => process.exit(0));
