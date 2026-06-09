import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let projectId = "";
let databaseId = "";
try {
  const configStr = fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8");
  const config = JSON.parse(configStr);
  projectId = config.projectId;
  databaseId = config.firestoreDatabaseId;
} catch (e) {
  console.warn("Could not read firebase-applet-config.json:", e);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: projectId || undefined,
      credential: admin.credential.applicationDefault()
    });
  } catch (error) {
    console.error("Firebase admin init error:", error);
  }
}

const adminDb = databaseId ? getFirestore(admin.app(), databaseId) : getFirestore(admin.app());

export { admin, adminDb };
