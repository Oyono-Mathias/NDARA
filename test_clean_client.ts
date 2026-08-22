import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
config.apiKey = "AIzaSyAAQS8TPPUEH2AvQNfw_OwasKKNdhn-67w"; // Known public API key for this project

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'oyonomathias@gmail.com', 'admin123');
    console.log("Logged in:", cred.user.uid);
    
    // Try reading users
    const userDoc = await getDocs(query(collection(db, 'users')));
    console.log("Read users collection, docs count:", userDoc.docs.length);

    // Try reading kyc_requests
    try {
      const kycDocs = await getDocs(query(collection(db, 'kyc_requests')));
      console.log("Read kyc_requests, docs count:", kycDocs.docs.length);
    } catch (err: any) {
      console.error("KYC Requests error:", err.code, err.message);
    }

    // Try reading audit_logs
    try {
      const auditDocs = await getDocs(query(collection(db, 'audit_logs')));
      console.log("Read audit_logs, docs count:", auditDocs.docs.length);
    } catch (err: any) {
      console.error("Audit Logs error:", err.code, err.message);
    }

    process.exit(0);
  } catch (err: any) {
    console.error("Login or other error:", err.message);
    process.exit(1);
  }
}
run();
