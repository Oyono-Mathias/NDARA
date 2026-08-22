import { admin, adminDb, adminAuth } from './src/lib/firebaseAdmin.js';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import fs from 'fs';

const API_KEY = "AIzaSyAAQS8TPPUEH2AvQNfw_OwasKKNdhn-67w";
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
firebaseConfig.apiKey = API_KEY;
const clientApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);
const dbClient = getFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

async function run() {
  const user = await admin.auth().getUserByEmail('oyonomathias@gmail.com');
  const token = await admin.auth().createCustomToken(user.uid);
  const userCredential = await signInWithCustomToken(clientAuth, token);
  console.log("Logged in as:", userCredential.user.uid);
  
  console.log("Testing kyc_requests...");
  try {
    const q = query(collection(dbClient, 'kyc_requests'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    console.log("Fetched kyc_requests docs:", snap.docs.length);
  } catch (err: any) {
    console.error("KYC Requests error:", err.message);
  }

  console.log("Testing audit_logs onSnapshot...");
  try {
     const uq = query(collection(dbClient, 'audit_logs'));
     onSnapshot(uq, 
        (snap) => { console.log("audit_logs snapshot received:", snap.docs.length); },
        (err) => { console.error("audit_logs snapshot error:", err.message); }
     );
  } catch (err: any) {}

  await new Promise(resolve => setTimeout(resolve, 2000));
  process.exit(0);
}
run();
