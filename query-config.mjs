import { adminDb } from "./dist/server.cjs";
async function run() {
  const conf = await adminDb.collection("settings").doc("global_config").get();
  console.log("Config keys:", Object.keys(conf.data() || {}));
  console.log("Bunny API Key:", conf.data()?.bunny_stream_api_key);
}
run();
