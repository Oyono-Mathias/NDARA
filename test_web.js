import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const q = query(collection(db, 'test'), limit(1));
    await getDocs(q);
    console.log("WEB SUCCESS!");
  } catch(e) {
    console.error("WEB FAIL:", e.message);
  }
}
test();
