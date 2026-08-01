const admin = require('firebase-admin');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
admin.initializeApp({ projectId: config.projectId });
const db = admin.firestore();
if (config.firestoreDatabaseId) {
    db.settings({ databaseId: config.firestoreDatabaseId });
}

async function run() {
    const snaps = await db.collectionGroup('assignments').get();
    console.log("Found assignments:", snaps.docs.map(d => d.data()));
    
    const enrolls = await db.collection('enrollments').get();
    console.log("Found enrollments:", enrolls.docs.map(d => d.data()));
}
run().catch(console.error);
