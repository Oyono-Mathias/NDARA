const { adminDb } = require("./dist/server.cjs");
async function run() {
  const conf = await adminDb.collection("settings").doc("global_config").get();
  console.log("Config keys:", Object.keys(conf.data() || {}));
  console.log("Bunny Stream API Key:", conf.data()?.bunny_stream_api_key);
  console.log("Bunny Stream Library ID:", conf.data()?.bunny_stream_library_id);
}
run();
