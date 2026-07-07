import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

admin.initializeApp({
  projectId: config.projectId,
  credential: admin.credential.applicationDefault()
});
const db = getFirestore(admin.app(), config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await db.collection('settings').limit(1).get();
    console.log("Docs:", snap.docs.length);
  } catch (e) {
    console.error(e);
  }
}
test();
