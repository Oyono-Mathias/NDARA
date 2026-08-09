import { adminDb } from "./src/lib/firebaseAdmin.js";

async function test() {
  try {
    const snapshot = await adminDb.collection("users").limit(1).get();
    console.log("Success", snapshot.empty);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
