const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

admin.initializeApp({
  projectId: "gen-lang-client-0381307586",
  credential: admin.credential.applicationDefault()
});
const db = getFirestore(admin.app(), "ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008");

db.collection('users').limit(1).get().then(snap => {
  console.log("Found users: ", snap.size);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
