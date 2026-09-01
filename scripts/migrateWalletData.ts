import * as fs from 'fs';

console.log("[MIGRATE-WALLET] Analyzing wallet structures...");
const isDryRun = process.env.DRY_RUN !== 'false';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn("BLOCKED: Emulator required for wallet migrations.");
    if (!isDryRun) {
        process.exit(2);
    }
}

let admin: any;
let db: any;
try {
    admin = require('firebase-admin');
} catch (e) {
    admin = null;
}

if (!admin || !process.env.FIRESTORE_EMULATOR_HOST) {
    console.log("[MIGRATE-WALLET] Environment not ready for live connection. Using local fixtures for DRY RUN test.");
    if (!isDryRun) {
        console.error("FAIL: Cannot run live migration without Firebase Admin and Emulator.");
        process.exit(2);
    }
    const fixtures = [
        { id: "w1", balance: 5000, currency: "XAF", userId: "user1", migrationVersion: undefined },
        { id: "w2", balance: -500, currency: "XAF", userId: "user2", migrationVersion: undefined },
        { id: "w3", balance: 10000, currency: "XAF", userId: "user3", migrationVersion: 1 }
    ];

    let analyzed = 0;
    let modified = 0;
    let conflicts = 0;

    for (const w of fixtures) {
        analyzed++;
        if (w.balance < 0) {
            console.error(`[MIGRATE-WALLET] MIGRATION CONFLICT: Wallet ${w.id} has negative balance.`);
            conflicts++;
            continue;
        }
        if (w.migrationVersion === 1) {
            console.log(`[MIGRATE-WALLET] Idempotence: Wallet ${w.id} already migrated.`);
            continue;
        }
        console.log(`[MIGRATE-WALLET] Action planned: Update wallet ${w.id} to migrationVersion: 1 and ensure schema.`);
        modified++;
    }

    console.log("[MIGRATE-WALLET] DRY RUN — NO DATA MODIFIED");
    console.log(`[MIGRATE-WALLET] Wallets analyzed: ${analyzed}, Modifications planned: ${modified}, Conflicts: ${conflicts}`);
    process.exit(0);
}

// Live Firebase Logic
(async () => {
    if (!admin.apps.length) {
        admin.initializeApp({ projectId: "demo-project" });
    }
    db = admin.firestore();

    const snapshot = await db.collection('wallets').get();
    let analyzed = 0;
    let modified = 0;
    let conflicts = 0;
    
    const batch = db.batch();

    snapshot.forEach((doc: any) => {
        analyzed++;
        const data = doc.data();
        
        if (typeof data.balance !== 'number' || data.balance < 0) {
            console.error(`[MIGRATE-WALLET] MIGRATION CONFLICT: Wallet ${doc.id} has invalid balance.`);
            conflicts++;
            return;
        }
        
        if (data.migrationVersion === 1) {
            console.log(`[MIGRATE-WALLET] Idempotence: Wallet ${doc.id} already migrated.`);
            return;
        }

        console.log(`[MIGRATE-WALLET] Action planned: Update wallet ${doc.id} (version set to 1)`);
        modified++;
        
        if (!isDryRun) {
            batch.update(doc.ref, { migrationVersion: 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
    });

    if (isDryRun) {
        console.log("[MIGRATE-WALLET] DRY RUN — NO DATA MODIFIED");
    } else if (modified > 0) {
        console.log("[MIGRATE-WALLET] Committing live changes...");
        await batch.commit();
        console.log("[MIGRATE-WALLET] Live migration successful.");
    }

    console.log(`[MIGRATE-WALLET] Wallets analyzed: ${analyzed}, Modifications planned/done: ${modified}, Conflicts: ${conflicts}`);
    process.exit(0);
})().catch((err) => {
    console.error("FAIL: Error during wallet migration:", err);
    process.exit(1);
});
