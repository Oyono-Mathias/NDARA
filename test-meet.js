import fetch from "node-fetch";

async function test() {
  const adminDb = require("./src/lib/firebaseAdmin.js").adminDb;
  const doc = await adminDb.collection('settings').doc('global_config').get();
  console.log("Token: ", doc.data()?.google_workspace_token ? "Exists" : "Missing");
}
test();
