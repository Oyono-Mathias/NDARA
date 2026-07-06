import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = admin.initializeApp({ projectId: config.projectId });
const db = getFirestore(app, config.firestoreDatabaseId);

db.collection('test').get().then(snap => {
    console.log(snap.size);
}).catch(console.error);
