const { adminDb } = require('./src/lib/firebaseAdmin.ts');

async function checkData() {
  try {
    const kycSnap = await adminDb.collection('kyc_requests').get();
    console.log(`Found ${kycSnap.size} kyc_requests`);
    kycSnap.forEach(doc => console.log(doc.id, doc.data()));

    const auditSnap = await adminDb.collection('security_audit_logs').limit(5).get();
    console.log(`Found ${auditSnap.size} security_audit_logs (limit 5)`);
    auditSnap.forEach(doc => console.log(doc.id, doc.data()));
  } catch(e) {
    console.error(e);
  }
}
checkData();
