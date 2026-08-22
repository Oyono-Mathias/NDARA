import { initializeApp as initClient } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { adminDb, admin } from './src/lib/firebaseAdmin.js';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initClient(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    const user = await admin.auth().getUserByEmail('oyonomathias@gmail.com');
    const token = await admin.auth().createCustomToken(user.uid);
    const userCredential = await signInWithCustomToken(auth, token);
    console.log("Logged in as:", userCredential.user.uid);
    
    const q = query(collection(db, 'kyc_requests'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    console.log("Fetched docs:", snap.docs.length);
    process.exit(0);
  } catch (e: any) {
    console.error("ERROR:", e.code, e.message);
    process.exit(1);
  }
}
run();
