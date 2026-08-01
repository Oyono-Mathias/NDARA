import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const q = collection(db, 'enrollments');
  const snap = await getDocs(q);
  const data = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
  console.log(JSON.stringify(data, null, 2));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
