import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const snapshot = await getDocs(collection(db, "ambassadors"));
    console.log("Success", snapshot.empty);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
