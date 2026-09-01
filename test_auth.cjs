if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.warn("BLOCKED: Firebase Auth Emulator not detected.");
    process.exit(2);
}
console.log("PASS: Auth Emulator available.");
process.exit(0);
