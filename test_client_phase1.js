import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

let configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const auth = getAuth(app);

async function runTest() {
    try {
        console.log("--- STARTING REAL TEST ---");
        const email = `test_real_${Date.now()}@example.com`;
        const password = 'Password123!';
        
        console.log("Creating user via Client SDK...");
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: 'Real Test User', photoURL: 'https://example.com/photo.png' });
        
        console.log("Got user:", userCred.user.uid);
        
        // Force refresh token to include updated profile info
        await userCred.user.reload();
        const idToken = await userCred.user.getIdToken(true);
        console.log("Got ID Token");
        
        console.log("\n--- TEST A: complete-registration ---");
        const regRes = await fetch('http://localhost:3000/api/auth/complete-registration', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ refCode: 'TESTREF' })
        });
        
        console.log("Complete-registration status:", regRes.status);
        console.log("Response:", await regRes.text());
        
        console.log("\n--- TEST B: Idempotence ---");
        const regRes2 = await fetch('http://localhost:3000/api/auth/complete-registration', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });
        console.log("Idempotence status:", regRes2.status);
        
        console.log("\n--- TEST C: Track (Login) ---");
        const trackRes = await fetch('http://localhost:3000/api/user/track', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });
        console.log("Track status:", trackRes.status);

        console.log("\n--- TEST D: Spoofed UID ---");
        const spoofRes = await fetch('http://localhost:3000/api/auth/complete-registration', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ uid: 'FAKE_UID_HACKER', refCode: 'TESTREF' })
        });
        console.log("Spoofed UID status:", spoofRes.status);

        console.log("\n--- TEST E: Security Rules - Client trying to update role ---");
        const updateRes = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/users/${userCred.user.uid}?updateMask.fieldPaths=role`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/users/${userCred.user.uid}`,
                fields: { role: { stringValue: 'admin' } }
            })
        });
        console.log("Update Role Status:", updateRes.status);
        if (updateRes.status === 403 || updateRes.status === 400) { // 403 forbidden or 400 bad request (REST API)
            console.log("TEST E: PASS - Client cannot change role.");
        }
        
        console.log("\nTests Complete.");
        process.exit(0);
        
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}
runTest();
