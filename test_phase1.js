import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'demo-project';
let apiKey = '';
try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        projectId = config.projectId || projectId;
        apiKey = config.apiKey;
    }
} catch (e) {}

if (!admin.apps.length) {
    admin.initializeApp({ projectId });
}

const db = getFirestore(admin.app(), "ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008");
// if the above fails due to permission, we will catch it. Actually, wait. Let's try without databaseId if it fails.

async function runTests() {
  try {
    console.log("--- STARTING TESTS ---");
    
    // Create a mock user in Firebase Auth
    const testEmail = `test_${Date.now()}@example.com`;
    const userRecord = await admin.auth().createUser({
      email: testEmail,
      password: 'password123',
      displayName: 'Test User'
    });
    console.log(`Created test user: ${userRecord.uid}`);
    
    // Get custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    // Exchange custom token for ID token
    const tokenRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    });
    const tokenData = await tokenRes.json();
    const idToken = tokenData.idToken;
    console.log("Got ID token for test user.");
    
    // Test 1: New account (Complete Registration)
    const regRes = await fetch('http://localhost:3000/api/auth/complete-registration', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ refCode: 'TESTREF' })
    });
    console.log("Complete Registration Status:", regRes.status);
    
    // Verify in Firestore using Admin SDK
    // Since adminDb might have permission issues in AI Studio preview if ADC is not fully set for specific DBs, 
    // we'll try to read it.
    let userDoc;
    try {
        const docRef = db.collection('users').doc(userRecord.uid);
        const snap = await docRef.get();
        if (snap.exists) {
            userDoc = snap.data();
            console.log("TEST 1 - New Account Firestore Data:", {
                uid: userDoc.uid,
                email: userDoc.email,
                displayName: userDoc.displayName,
                role: userDoc.role,
                createdAt: userDoc.createdAt ? "PRESENT" : "MISSING",
                updatedAt: userDoc.updatedAt ? "PRESENT" : "MISSING",
                lastLoginAt: userDoc.lastLoginAt ? "PRESENT" : "MISSING",
            });
        } else {
            console.log("TEST 1 - FAILED: Document not found in Firestore.");
        }
    } catch (e) {
        console.error("Firestore Admin SDK error:", e.message);
    }

    // Test 6: Idempotence
    const regRes2 = await fetch('http://localhost:3000/api/auth/complete-registration', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ refCode: 'TESTREF' })
    });
    console.log("Idempotence call Status:", regRes2.status);
    
    if (userDoc) {
        const snap2 = await db.collection('users').doc(userRecord.uid).get();
        const userDoc2 = snap2.data();
        if (userDoc.createdAt._seconds === userDoc2.createdAt._seconds) {
            console.log("TEST 6 - Idempotence: PASS (createdAt identical)");
        } else {
            console.log("TEST 6 - Idempotence: FAIL (createdAt changed)");
        }
    }

    // Test 4: Login Tracking
    const trackRes = await fetch('http://localhost:3000/api/user/track', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });
    console.log("User Track Status:", trackRes.status);
    
    // Test 7: Security Rules - try to update role via REST API (acting as client)
    const updateRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008/documents/users/${userRecord.uid}?updateMask.fieldPaths=role`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: `projects/${projectId}/databases/ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008/documents/users/${userRecord.uid}`,
            fields: { role: { stringValue: 'admin' } }
        })
    });
    console.log("Security Rule Update Role Status:", updateRes.status, await updateRes.text());
    
    // Cleanup
    await admin.auth().deleteUser(userRecord.uid);
    console.log("Test user deleted.");
    
  } catch (err) {
    console.error(err);
  }
}

runTests();
