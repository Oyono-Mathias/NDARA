import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, limit } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const q = query(collection(db, "ambassadors"), where("referralCode", "==", "TEST1234"), where("status", "==", "active"), limit(1));
    const snapshot = await getDocs(q);
    console.log("Success", snapshot.empty);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
