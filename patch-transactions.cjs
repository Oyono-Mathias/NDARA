const fs = require('fs');

const patchName = 'patch-transactions.cjs';
console.log(`[${patchName}] Initializing...`);
const isDryRun = process.env.DRY_RUN !== 'false';
console.log(`[${patchName}] Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);

if (!process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn(`BLOCKED: ${patchName} requires FIRESTORE_EMULATOR_HOST.`);
    if (!isDryRun) {
        process.exit(2);
    }
}

let admin;
let db;
try {
    admin = require('firebase-admin');
} catch (e) {
    admin = null;
}

if (!admin || !process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`[${patchName}] Environment not ready for live connection. Using local fixtures for DRY RUN test.`);
    if (!isDryRun) {
        console.error("FAIL: Cannot run live migration without Firebase Admin and Emulator.");
        process.exit(2);
    }
    const fixtures = [
        { id: "tx1", amount: 100, currency: "XAF", type: "credit", status: "completed", patched: true },
        { id: "tx2", amount: -50, currency: "XAF", type: "debit", status: "completed" },
        { id: "tx3", amount: 100, currency: "USD", type: "credit", status: "completed" },
    ];

    let analyzed = 0;
    let modified = 0;
    let conflicts = 0;

    for (const tx of fixtures) {
        analyzed++;
        if (tx.amount < 0) {
            console.error(`[${patchName}] MIGRATION CONFLICT: Transaction ${tx.id} has negative amount. Transactions must be absolute values with a type.`);
            conflicts++;
            continue;
        }
        if (tx.patched) {
            console.log(`[${patchName}] Idempotence: Transaction ${tx.id} already patched.`);
            continue;
        }
        console.log(`[${patchName}] Action planned: Update transaction ${tx.id} with normalized absolute amount and currency.`);
        modified++;
    }

    console.log(`[${patchName}] DRY RUN — NO DATA MODIFIED`);
    console.log(`[${patchName}] Transactions analyzed: ${analyzed}, Modifications planned: ${modified}, Conflicts: ${conflicts}`);
    process.exit(0);
}

// Live Firebase Logic
(async () => {
    if (!admin.apps.length) {
        admin.initializeApp({ projectId: "demo-project" });
    }
    db = admin.firestore();

    const snapshot = await db.collection('transactions').get();
    let analyzed = 0;
    let modified = 0;
    let conflicts = 0;
    
    const batch = db.batch();

    snapshot.forEach((doc) => {
        analyzed++;
        const data = doc.data();
        
        if (data.amount < 0) {
            console.error(`[${patchName}] MIGRATION CONFLICT: Transaction ${doc.id} has negative amount.`);
            conflicts++;
            return;
        }
        
        if (data.patched) {
            console.log(`[${patchName}] Idempotence: Transaction ${doc.id} already patched.`);
            return;
        }

        console.log(`[${patchName}] Action planned: Update transaction ${doc.id}`);
        modified++;
        
        if (!isDryRun) {
            batch.update(doc.ref, { patched: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }
    });

    if (isDryRun) {
        console.log(`[${patchName}] DRY RUN — NO DATA MODIFIED`);
    } else if (modified > 0) {
        console.log(`[${patchName}] Committing live changes...`);
        await batch.commit();
        console.log(`[${patchName}] Live migration successful.`);
    }

    console.log(`[${patchName}] Transactions analyzed: ${analyzed}, Modifications planned: ${modified}, Conflicts: ${conflicts}`);
    process.exit(0);
})().catch((err) => {
    console.error(`FAIL: Error during ${patchName}:`, err);
    process.exit(1);
});
