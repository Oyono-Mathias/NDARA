import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  projectId: config.projectId,
  credential: admin.credential.applicationDefault()
});

const db = getFirestore(admin.app(), config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await db.collection('users').limit(1).get();
    console.log("Docs:", snap.docs.length);
  } catch (e) {
    console.error(e);
  }
}
test();
