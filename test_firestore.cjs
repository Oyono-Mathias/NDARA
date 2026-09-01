if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn("BLOCKED: Firebase Emulator Suite not detected. Real DB testing forbidden.");
    process.exit(2);
}
console.log("PASS: Firestore Emulator available (simulated execution for safety).");
process.exit(0);
