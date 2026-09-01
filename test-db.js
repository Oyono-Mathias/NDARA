import fs from 'fs';
const hasFirebaseConfig = fs.existsSync('src/lib/firebase.ts') || fs.existsSync('src/firebase.ts');
if (!hasFirebaseConfig) {
    console.error("FAIL: Firebase configuration not found in src/");
    process.exit(1);
}
if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn("BLOCKED: Missing FIRESTORE_EMULATOR_HOST for safe DB testing.");
    process.exit(2);
}
console.log("PASS: Firebase configuration verified and emulator is ready.");
process.exit(0);
