import { execSync } from 'child_process';

console.log("[MIGRATION-LOCAL] Initializing local migration...");

if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn("BLOCKED: FIRESTORE_EMULATOR_HOST is required for local migrations.");
    // In DRY_RUN, we still block live execution, but the dry run itself is allowed via fixtures inside the specific scripts.
}

const isDryRun = process.env.DRY_RUN !== 'false';
console.log(`[MIGRATION-LOCAL] DRY_RUN: ${isDryRun}`);

const scriptsToRun = [
    "npx tsx scripts/migrateWalletData.ts"
];

for (const script of scriptsToRun) {
    try {
        console.log(`\n--- Running ${script} ---`);
        execSync(script, { stdio: 'inherit' });
    } catch (error: any) {
        console.error(`\nFAIL: Error running ${script}. Exit code: ${error.status}`);
        process.exit(error.status || 1);
    }
}
process.exit(0);
