import { adminDb } from "./dist/lib/firebaseAdmin.js";

async function test() {
  try {
    const snapshot = await adminDb.collection("ambassadors").where("referralCode", "==", "TEST1234").limit(1).get();
    console.log("Success", snapshot.empty);
  } catch(e) {
    console.error("Error", e);
  }
}
test();
