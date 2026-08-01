const admin = require('firebase-admin');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
admin.initializeApp({
  projectId: config.projectId,
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore(admin.app(), config.firestoreDatabaseId);

async function test() {
  const snapshot = await db.collection('users').get();
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
test().catch(console.error);
