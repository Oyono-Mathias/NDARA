const admin = require('firebase-admin');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  projectId: config.projectId,
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore(admin.app(), '(default)');

async function test() {
  try {
    const snap = await db.collection('test').limit(1).get();
    console.log("DEFAULT SUCCESS!");
  } catch(e) {
    console.error("DEFAULT FAIL:", e.message);
  }
}
test();
