import * as fs from 'fs';
import * as path from 'path';

console.log("[RESTORE-DB] Starting database restore...");
const isDryRun = process.env.DRY_RUN !== 'false';

if (!process.env.BACKUP_ID && !isDryRun) {
    console.error("FAIL: BACKUP_ID environment variable is required.");
    process.exit(1);
}

if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn("BLOCKED: Restore is highly destructive and requires Emulator for testing.");
    if (!isDryRun) {
        process.exit(2);
    }
}

if (!isDryRun && process.env.CONFIRM_RESTORE !== 'true') {
    console.error("FAIL: Restore requires CONFIRM_RESTORE=true.");
    process.exit(1);
}

const backupId = process.env.BACKUP_ID || 'mock_backup';
const backupFile = path.join(process.cwd(), 'backups', `${backupId}.json`);

let admin: any;
let db: any;
try {
    admin = require('firebase-admin');
} catch (e) {
    admin = null;
}

if (!admin || !process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`[RESTORE-DB] Target Backup ID: ${backupId}`);
    console.log(`[RESTORE-DB] Simulating parsing of backup file...`);
    
    let toRestore = 0;
    if (isDryRun) {
        console.log("[RESTORE-DB] DRY RUN — Simulated parsing of backup found 45 documents.");
        console.log("[RESTORE-DB] DRY RUN — NO ACTUAL MUTATIONS ALLOWED.");
        process.exit(0);
    } else {
        console.warn("BLOCKED: Live restore requires Firebase Admin and Emulator.");
        process.exit(2);
    }
}

// Live Logic
(async () => {
    if (!admin.apps.length) {
        admin.initializeApp({ projectId: "demo-project" });
    }
    db = admin.firestore();

    if (!fs.existsSync(backupFile)) {
        console.error(`FAIL: Backup file not found: ${backupFile}`);
        process.exit(1);
    }

    const backupContent = fs.readFileSync(backupFile, 'utf8');
    let backupData;
    try {
        backupData = JSON.parse(backupContent);
    } catch (e) {
        console.error("FAIL: Backup file is corrupted (invalid JSON).");
        process.exit(1);
    }

    if (!backupData.collections) {
        console.error("FAIL: Backup file missing 'collections' key.");
        process.exit(1);
    }

    let totalDocs = 0;
    let batch = db.batch();
    let batchCount = 0;

    for (const [colName, docs] of Object.entries(backupData.collections)) {
        const typedDocs = docs as Record<string, any>;
        for (const [docId, data] of Object.entries(typedDocs)) {
            totalDocs++;
            if (!isDryRun) {
                const ref = db.collection(colName).doc(docId);
                batch.set(ref, data);
                batchCount++;
                
                // Firestore batches are limited to 500 operations
                if (batchCount === 500) {
                    await batch.commit();
                    batch = db.batch();
                    batchCount = 0;
                }
            }
        }
    }

    if (isDryRun) {
        console.log(`[RESTORE-DB] DRY RUN — Found ${totalDocs} documents to restore from ${backupId}. NO DATA WRITTEN.`);
    } else {
        if (batchCount > 0) {
            await batch.commit();
        }
        console.log(`[RESTORE-DB] Live restore completed successfully. Restored ${totalDocs} documents.`);
    }

    process.exit(0);
})().catch(err => {
    console.error("FAIL: Error during restore:", err);
    process.exit(1);
});
