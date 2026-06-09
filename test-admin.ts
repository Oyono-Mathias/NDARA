import { adminDb } from "./src/lib/firebaseAdmin.js";

async function test() {
  try {
    const snap = await adminDb.collection("users").limit(1).get();
    console.log("Success! Docs:", snap.docs.length);
  } catch (e) {
    console.error("Failed:", e);
  }
}

test();
