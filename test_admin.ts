import admin from 'firebase-admin';

try {
  admin.initializeApp();
  const db = admin.firestore();
  db.collection('users').limit(1).get().then(() => {
    console.log("Admin initialized successfully and accessed DB");
  }).catch((e: any) => {
    console.log("DB access failed:", e);
  });
} catch(e) {
  console.log("Admin initialization failed:", e);
}
