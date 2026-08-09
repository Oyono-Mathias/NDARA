import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const res = await getDocs(collection(db, 'users'));
    console.log('Success, found docs:', res.size);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
