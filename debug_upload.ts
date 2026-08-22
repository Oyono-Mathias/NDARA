import { admin, adminDb } from './src/lib/firebaseAdmin.js';
import fetch from 'node-fetch';

async function run() {
  const ambA_uid = "debug_a_" + Date.now();
  const ambB_uid = "debug_b_" + Date.now();
  const docPath = `documents/kyc/${ambA_uid}/test.jpg`;
  
  await adminDb.collection("kyc_requests").add({
     userId: ambA_uid,
     documentStoragePath: docPath
  });

  const kycDocs = await adminDb.collection("kyc_requests").where("documentStoragePath", "==", docPath).get();
  const isOwner = kycDocs.docs.some(doc => doc.data().userId === ambB_uid);
  console.log("Is Owner:", isOwner);
}
run();
