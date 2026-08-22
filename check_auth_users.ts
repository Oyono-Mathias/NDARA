import { adminAuth } from './src/lib/firebaseAdmin.js';
async function run() {
  try {
    const user = await adminAuth.getUserByEmail('oyonomathias@gmail.com');
    console.log("Auth User:", user.uid, user.providerData);
  } catch (e) {
    console.error(e);
  }
}
run();
