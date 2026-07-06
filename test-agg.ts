import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = admin.initializeApp({ projectId: config.projectId });
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  const coll = db.collection('enrollments');
  try {
    const snap = await coll.where("instructorId", "==", "some-uid").count().get();
    console.log("Count:", snap.data().count);
  } catch (e) {
    console.error(e);
  }
}
test();
