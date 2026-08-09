import { adminDb } from "./src/lib/firebaseAdmin.js";

async function test() {
  try {
    const snapshot = await adminDb.collection("ambassadors").doc("123").get();
    console.log("Success", snapshot.exists);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
