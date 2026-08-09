import { adminDb } from "./src/lib/firebaseAdmin.js";

async function test() {
  try {
    adminDb.settings({ preferRest: true });
    const snapshot = await adminDb.collection("ambassadors").limit(1).get();
    console.log("Success", snapshot.empty);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
