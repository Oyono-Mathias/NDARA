import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
config.apiKey = "AIzaSyAAQS8TPPUEH2AvQNfw_OwasKKNdhn-67w";

admin.initializeApp({
  projectId: config.projectId,
  credential: admin.credential.applicationDefault()
});

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const user = await admin.auth().getUserByEmail('oyonomathias@gmail.com');
    const customToken = await admin.auth().createCustomToken(user.uid);
    
    const cred = await signInWithCustomToken(auth, customToken);
    console.log("Logged in:", cred.user.uid);
    
    // Test direct document read
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    console.log("User doc read:", userDoc.exists(), userDoc.data()?.role);

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
    console.error("Error:", err.message);
    process.exit(1);
  }
}
run();
