const { execSync } = require('child_process');

console.log("[MIGRATION-ORCHESTRATOR] Starting...");

// 1. Check environment
if (!process.env.FIRESTORE_EMULATOR_HOST && process.env.NODE_ENV === 'production') {
    if (!process.env.ALLOW_PRODUCTION_MIGRATION || process.env.CONFIRM_PRODUCTION !== 'true') {
        console.error("FAIL: Production migration requires explicit authorization (ALLOW_PRODUCTION_MIGRATION & CONFIRM_PRODUCTION).");
        process.exit(2);
    }
}

const isDryRun = process.env.DRY_RUN !== 'false';
console.log(`[MIGRATION-ORCHESTRATOR] DRY_RUN is set to ${isDryRun}`);

if (!isDryRun && !process.env.CONFIRM_MIGRATION) {
    console.error("FAIL: Live migration requires CONFIRM_MIGRATION=true.");
    process.exit(2);
}

const scriptsToRun = [
    "node trigger_migrate.cjs"
];

let allPass = true;

for (const script of scriptsToRun) {
    try {
        console.log(`\n--- Running ${script} ---`);
        execSync(script, { stdio: 'inherit' });
    } catch (error) {
        console.error(`\nFAIL: Error running ${script}. Exit code: ${error.status}`);
        allPass = false;
        process.exit(error.status || 1); // propagate failure
    }
}

if (allPass) {
    console.log("\n[MIGRATION-ORCHESTRATOR] All tasks completed successfully.");
    process.exit(0);
}
