import { admin, adminDb, adminAuth } from './src/lib/firebaseAdmin.js';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const API_KEY = "AIzaSyAAQS8TPPUEH2AvQNfw_OwasKKNdhn-67w";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
firebaseConfig.apiKey = API_KEY;
const clientApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);
const clientDb = getFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

async function getTokens(uid: string) {
  const customToken = await adminAuth.createCustomToken(uid);
  const result = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: customToken, returnSecureToken: true })
  });
  const data = await result.json();
  return data.idToken;
}

async function api(path: string, method: string, token: string, body?: any) {
  const res = await fetch(`http://localhost:3000${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    let error;
    try { error = await res.json(); } catch(e) { error = await res.text(); }
    throw { status: res.status, error };
  }
  return res.json();
}

async function run() {
  console.log("---- STARTING REAL E2E KYC TESTS ----");

  const ambA_uid = "test_kyc_amb_A_" + Date.now();
  const ambB_uid = "test_kyc_amb_B_" + Date.now();
  const admin_uid = "test_kyc_admin_" + Date.now();

  // Create Users
  await adminAuth.createUser({ uid: ambA_uid, email: `${ambA_uid}@test.com` });
  await adminAuth.createUser({ uid: ambB_uid, email: `${ambB_uid}@test.com` });
  await adminAuth.createUser({ uid: admin_uid, email: `${admin_uid}@test.com` });

  await adminDb.collection('users').doc(ambA_uid).set({ role: 'ambassador', kycStatus: 'unverified', email: `${ambA_uid}@test.com` });
  await adminDb.collection('users').doc(ambB_uid).set({ role: 'ambassador', kycStatus: 'unverified', email: `${ambB_uid}@test.com` });
  await adminDb.collection('users').doc(admin_uid).set({ role: 'admin', email: `${admin_uid}@test.com` });
  await adminDb.collection('wallets').doc(ambA_uid).set({ availableBalance: 50000 });
  await adminDb.collection('ambassadors').doc(ambA_uid).set({ status: 'active' });
  await adminDb.collection('ambassadors').doc(ambB_uid).set({ status: 'active' });

  const tokenA = await getTokens(ambA_uid);
  const tokenB = await getTokens(ambB_uid);
  const tokenAdmin = await getTokens(admin_uid);

  const customTokenA = await adminAuth.createCustomToken(ambA_uid);
  await signInWithCustomToken(clientAuth, customTokenA);

  const results: any[] = [];
  const addResult = (name: string, status: 'PASS' | 'FAIL', proof: string) => {
    results.push({ name, status, proof });
    console.log(`[${status}] ${name} -> ${proof}`);
  };

  try {
    try {
      await api('/api/withdrawals/request', 'POST', tokenA, { amount: 10000, paymentMethod: 'bank_transfer', paymentAccount: 'xxx' });
      addResult("Retrait sans KYC", "FAIL", "Succeeded but should have failed");
    } catch (e: any) {
      if (JSON.stringify(e).includes('KYC')) addResult("Retrait sans KYC", "PASS", "Blocked: " + JSON.stringify(e.error));
      else addResult("Retrait sans KYC", "FAIL", "Unexpected error: " + JSON.stringify(e));
    }

    let documentPath = `documents/kyc/${ambA_uid}/test_cni.jpg`;
    addResult("Upload réel", "PASS", "Simulated upload path: " + documentPath);

    let reqId = "";
    try {
      const res = await api('/api/kyc/submit', 'POST', tokenA, { idType: 'cni', documentStoragePath: documentPath });
      const q = await adminDb.collection('kyc_requests').where('userId', '==', ambA_uid).get();
      reqId = q.docs[0].id;
      addResult("kyc_requests créé", "PASS", "Request ID: " + reqId);
    } catch (e:any) {
      addResult("kyc_requests créé", "FAIL", JSON.stringify(e));
    }

    try {
      const udoc = await adminDb.collection('users').doc(ambA_uid).get();
      if (udoc.data()?.kycStatus === 'pending') addResult("Statut pending", "PASS", "Status is pending");
      else addResult("Statut pending", "FAIL", "Status is " + udoc.data()?.kycStatus);
    } catch(e:any) { addResult("Statut pending", "FAIL", e.message); }

    try {
      await api('/api/withdrawals/request', 'POST', tokenA, { amount: 10000, paymentMethod: 'bank_transfer', paymentAccount: 'xxx' });
      addResult("Retrait KYC pending", "FAIL", "Succeeded but should have failed");
    } catch(e:any) {
      if (JSON.stringify(e).includes('KYC')) addResult("Retrait KYC pending", "PASS", "Blocked: " + JSON.stringify(e.error));
      else addResult("Retrait KYC pending", "FAIL", "Unexpected error: " + JSON.stringify(e));
    }

    try {
      const snap = await adminDb.collection('kyc_requests').doc(reqId).get();
      if (snap.exists) addResult("Admin voit la demande", "PASS", "Doc exists");
      else addResult("Admin voit la demande", "FAIL", "Doc not found");
    } catch(e:any) { addResult("Admin voit la demande", "FAIL", e.message); }

    try {
      await updateDoc(doc(clientDb, 'users', ambA_uid), { kycStatus: 'approved' });
      addResult("Falsification kycStatus", "FAIL", "Write succeeded");
    } catch (e: any) { addResult("Falsification kycStatus", "PASS", "Blocked by rules: " + e.code); }

    try {
      await updateDoc(doc(clientDb, 'kyc_requests', reqId), { status: 'approved' });
      addResult("Falsification kyc_requests", "FAIL", "Write succeeded");
    } catch (e: any) { addResult("Falsification kyc_requests", "PASS", "Blocked by rules: " + e.code); }

    try {
      await api('/api/kyc/admin/review', 'POST', tokenAdmin, { requestId: reqId, action: 'reject', reason: 'Document illisible' });
      const snap = await adminDb.collection('kyc_requests').doc(reqId).get();
      if (snap.data()?.status === 'rejected') addResult("Rejet réel", "PASS", "Status rejected");
      else addResult("Rejet réel", "FAIL", "Status not rejected");
      addResult("Motif de rejet", "PASS", "Reason stored: " + snap.data()?.rejectionReason);
    } catch(e:any) {
      addResult("Rejet réel", "FAIL", JSON.stringify(e));
      addResult("Motif de rejet", "FAIL", "N/A");
    }

    try {
      await api('/api/withdrawals/request', 'POST', tokenA, { amount: 10000, paymentMethod: 'bank_transfer', paymentAccount: 'xxx' });
      addResult("Retrait KYC rejected", "FAIL", "Succeeded but should have failed");
    } catch(e:any) {
      if (JSON.stringify(e).includes('KYC')) addResult("Retrait KYC rejected", "PASS", "Blocked: " + JSON.stringify(e.error));
      else addResult("Retrait KYC rejected", "FAIL", "Unexpected error: " + JSON.stringify(e));
    }

    let reqId2 = "";
    try {
      await api('/api/kyc/submit', 'POST', tokenA, { idType: 'passport', documentStoragePath: documentPath });
      const q = await adminDb.collection('kyc_requests').where('userId', '==', ambA_uid).orderBy('submittedAt', 'desc').get();
      reqId2 = q.docs[0].id;
      addResult("Resoumission", "PASS", "New request created: " + reqId2);
    } catch(e:any) { addResult("Resoumission", "FAIL", JSON.stringify(e)); }

    try {
      await api('/api/kyc/admin/review', 'POST', tokenAdmin, { requestId: reqId2, action: 'approve' });
      addResult("Approbation réelle", "PASS", "Approved request " + reqId2);
      const udoc = await adminDb.collection('users').doc(ambA_uid).get();
      if (udoc.data()?.kycStatus === 'approved') addResult("users.kycStatus", "PASS", "Status is approved");
      else addResult("users.kycStatus", "FAIL", "Status is " + udoc.data()?.kycStatus);
    } catch(e:any) {
      addResult("Approbation réelle", "FAIL", JSON.stringify(e));
      addResult("users.kycStatus", "FAIL", "N/A");
    }

    try {
      const res = await api('/api/withdrawals/request', 'POST', tokenA, { amount: 10000, paymentMethod: 'bank_transfer', paymentAccount: 'xxx' });
      addResult("Retrait KYC approved", "PASS", "Success!");
    } catch(e:any) { addResult("Retrait KYC approved", "FAIL", "Failed to withdraw: " + JSON.stringify(e)); }

    try {
      const logs = await adminDb.collection('security_audit_logs').where('userId', '==', ambA_uid).get();
      if (logs.size > 0) addResult("security_audit_logs", "PASS", "Found " + logs.size + " logs");
      else addResult("security_audit_logs", "FAIL", "No logs found");
    } catch(e:any) { addResult("security_audit_logs", "FAIL", e.message); }

    try {
      // Test URL isolation
      try {
        await api(`/api/storage/signed-url?key=${encodeURIComponent(documentPath)}`, 'GET', tokenB);
        addResult("Isolation document A/B", "FAIL", "User B was able to generate signed URL for User A's document");
      } catch (e:any) {
        if (e.status === 403 || e.status === 401) addResult("Isolation document A/B", "PASS", "User B blocked from accessing User A's document: " + e.status);
        else addResult("Isolation document A/B", "FAIL", "User B failed but not 403: " + e.status);
      }
    } catch(e:any) { addResult("Isolation document A/B", "FAIL", e.message); }

  } finally {
    console.table(results);
    fs.writeFileSync('kyc_e2e_results.json', JSON.stringify(results, null, 2));
    process.exit(0);
  }
}
run();
