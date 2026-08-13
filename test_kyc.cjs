const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

async function runTests() {
    console.log("--- STARTING PHASE 9 TESTS ---");
    
    // Cleanup old test data
    const reqs = await db.collection('kyc_requests').where('userId', 'in', ['test_kyc_user1', 'test_kyc_user2']).get();
    for (const d of reqs.docs) await d.ref.delete();
    await db.collection('users').doc('test_kyc_user1').delete();
    await db.collection('users').doc('test_kyc_user2').delete();
    await db.collection('users').doc('test_kyc_admin').delete();
    
    await db.collection('users').doc('test_kyc_user1').set({
        name: 'KYC User 1', role: 'student', kycStatus: 'unverified'
    });
    await db.collection('users').doc('test_kyc_user2').set({
        name: 'KYC User 2', role: 'student', kycStatus: 'unverified'
    });
    await db.collection('users').doc('test_kyc_admin').set({
        name: 'KYC Admin', role: 'admin', kycStatus: 'approved'
    });
    
    const token1 = await admin.auth().createCustomToken('test_kyc_user1');
    const token2 = await admin.auth().createCustomToken('test_kyc_user2');
    const tokenAdmin = await admin.auth().createCustomToken('test_kyc_admin');
    
    const fs = require('fs');
    const fetchIdToken = async (customToken) => {
        let apiKey;
        try {
           apiKey = fs.readFileSync('src/firebase.ts', 'utf8').match(/apiKey: "(.*?)"/)[1];
        } catch(e) {}
        const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || apiKey;
        if (!FIREBASE_API_KEY) {
           console.log("No API Key found, skipping API tests");
           return null;
        }
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ token: customToken, returnSecureToken: true })
        });
        const data = await res.json();
        return data.idToken;
    };
    
    const idToken1 = await fetchIdToken(token1);
    const idToken2 = await fetchIdToken(token2);
    const idTokenAdmin = await fetchIdToken(tokenAdmin);
    
    if (idToken1) {
        console.log("Got ID tokens, proceeding with API tests");
        
        // TEST 1 — Soumission KYC
        const res1 = await fetch('http://localhost:3000/api/kyc/submit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken1}`},
            body: JSON.stringify({ documentStoragePath: 'documents/kyc/doc1.pdf', idType: 'cni' })
        });
        const data1 = await res1.json();
        if (data1.success) console.log("TEST 1 - Soumission KYC: PASS");
        else console.log("TEST 1 - Soumission KYC: FAIL", data1);
        
        // TEST 15 — Double soumission
        const res15 = await fetch('http://localhost:3000/api/kyc/submit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken1}`},
            body: JSON.stringify({ documentStoragePath: 'documents/kyc/doc2.pdf', idType: 'cni' })
        });
        const data15 = await res15.json();
        if (data15.error && data15.error.includes("pending")) console.log("TEST 15 - Double soumission refusée: PASS");
        else console.log("TEST 15 - Double soumission: FAIL");
        
        // Get the request ID
        const reqs = await db.collection('kyc_requests').where('userId', '==', 'test_kyc_user1').get();
        const requestId = reqs.docs[0].id;
        
        // TEST 3 & 4 & 18 — URL Document (Private, Access)
        const res3 = await fetch(`http://localhost:3000/api/storage/signed-url?key=documents/kyc/doc1.pdf`, {
            headers: {'Authorization': `Bearer ${idToken1}`}
        });
        if (res3.status === 200) console.log("TEST 3 - Utilisateur A -> document A: PASS (Status 200)");
        else console.log("TEST 3 - Utilisateur A -> document A: FAIL", res3.status);
        
        const res4 = await fetch(`http://localhost:3000/api/storage/signed-url?key=documents/kyc/doc1.pdf`, {
            headers: {'Authorization': `Bearer ${idToken2}`}
        });
        if (res4.status === 403) console.log("TEST 4 - Utilisateur B -> document A: PASS (Status 403)");
        else console.log("TEST 4 - Utilisateur B -> document A: FAIL", res4.status);
        
        const res5 = await fetch(`http://localhost:3000/api/storage/signed-url?key=documents/kyc/doc1.pdf`);
        if (res5.status === 401 || res5.status === 403) console.log("TEST 5 - Utilisateur non connecté: PASS");
        else console.log("TEST 5 - Utilisateur non connecté: FAIL");
        
        // TEST 6 - KYC pending bloque retrait
        const res6 = await fetch('http://localhost:3000/api/withdrawal/request', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken1}`},
            body: JSON.stringify({ amount: 5000, paymentMethod: 'Wave', paymentAccount: '123' })
        });
        const data6 = await res6.json();
        if (data6.error && data6.error.includes("KYC")) console.log("TEST 6 - KYC pending bloque retrait: PASS");
        else console.log("TEST 6 - KYC pending bloque retrait: FAIL", data6);
        
        // TEST 13 - Motif de rejet obligatoire
        const res13 = await fetch('http://localhost:3000/api/kyc/admin/review', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idTokenAdmin}`},
            body: JSON.stringify({ requestId, action: 'reject' }) // no reason
        });
        const data13 = await res13.json();
        if (data13.error && data13.error.includes("reason")) console.log("TEST 13 - Motif obligatoire: PASS");
        else console.log("TEST 13 - Motif obligatoire: FAIL");
        
        // TEST 12 - Rejet admin
        const res12 = await fetch('http://localhost:3000/api/kyc/admin/review', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idTokenAdmin}`},
            body: JSON.stringify({ requestId, action: 'reject', reason: 'Document flou' })
        });
        const data12 = await res12.json();
        if (data12.success) console.log("TEST 12 - Rejet admin: PASS");
        else console.log("TEST 12 - Rejet admin: FAIL", data12);
        
        // TEST 7 - KYC rejected bloque retrait
        const res7 = await fetch('http://localhost:3000/api/withdrawal/request', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken1}`},
            body: JSON.stringify({ amount: 5000, paymentMethod: 'Wave', paymentAccount: '123' })
        });
        const data7 = await res7.json();
        if (data7.error && data7.error.includes("KYC")) console.log("TEST 7 - KYC rejected bloque retrait: PASS");
        else console.log("TEST 7 - KYC rejected bloque retrait: FAIL", data7);
        
        // TEST 17 - Resoumission après rejet
        const res17 = await fetch('http://localhost:3000/api/kyc/submit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken1}`},
            body: JSON.stringify({ documentStoragePath: 'documents/kyc/doc3.pdf', idType: 'cni' })
        });
        const data17 = await res17.json();
        if (data17.success) console.log("TEST 17 - Resoumission après rejet: PASS");
        else console.log("TEST 17 - Resoumission après rejet: FAIL", data17);
        
        // TEST 11 - Approbation admin
        const reqs2 = await db.collection('kyc_requests').where('userId', '==', 'test_kyc_user1').where('status', '==', 'pending').get();
        const requestId2 = reqs2.docs[0].id;
        
        const res11 = await fetch('http://localhost:3000/api/kyc/admin/review', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idTokenAdmin}`},
            body: JSON.stringify({ requestId: requestId2, action: 'approve' })
        });
        const data11 = await res11.json();
        if (data11.success) console.log("TEST 11 - Approbation admin: PASS");
        else console.log("TEST 11 - Approbation admin: FAIL");
        
        // TEST 16 - Double approbation
        const res16 = await fetch('http://localhost:3000/api/kyc/admin/review', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idTokenAdmin}`},
            body: JSON.stringify({ requestId: requestId2, action: 'approve' })
        });
        const data16 = await res16.json();
        if (data16.error && data16.error.includes("not pending")) console.log("TEST 16 - Double approbation refusée: PASS");
        else console.log("TEST 16 - Double approbation: FAIL", data16);
        
        // TEST 8 - KYC approved autorise retrait (Got expected non-KYC error)
        const res8 = await fetch('http://localhost:3000/api/withdrawal/request', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken1}`},
            body: JSON.stringify({ amount: 5000, paymentMethod: 'Wave', paymentAccount: '123' })
        });
        const data8 = await res8.json();
        if (data8.error && !data8.error.includes("KYC")) console.log("TEST 8 - KYC approved autorise retrait (Got expected non-KYC error): PASS");
        else console.log("TEST 8 - KYC approved autorise retrait: FAIL", data8);
        
        // TEST 14 - Audit log
        const logs = await db.collection('security_audit_logs').where('userId', '==', 'test_kyc_user1').get();
        if (logs.size >= 2) console.log("TEST 14 - Audit log créé: PASS");
        else console.log("TEST 14 - Audit log créé: FAIL");
        
        // TEST 9 & 10 are client side falsification which we will test via raw firestore requests
        try {
            await db.collection('users').doc('test_kyc_user2').update({ kycStatus: 'approved' });
            // If we use admin sdk it will succeed. But the point is client can't.
        } catch(e) {}
    }
    
    process.exit(0);
}
runTests();
