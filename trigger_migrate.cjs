const { execSync } = require('child_process');

console.log("[TRIGGER-MIGRATE] Triggering migration tasks...");
const isDryRun = process.env.DRY_RUN !== 'false';

const tasks = [
    "npx tsx scripts/migrateWalletData.ts",
    "node patch-transactions.cjs",
    "npx tsx scripts/backupDatabase.ts",
    "npx tsx scripts/generateApiDocs.ts"
];

for (const task of tasks) {
    try {
        console.log(`\n=> Executing: ${task}`);
        execSync(task, { stdio: 'inherit' });
    } catch (e) {
        console.error(`FAIL: Trigger task failed: ${task}. Exit Code: ${e.status}`);
        process.exit(e.status || 1);
    }
}

console.log("\n[TRIGGER-MIGRATE] Completed triggers.");
process.exit(0);
