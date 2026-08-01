const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/lib/commissionEngine.ts');
let code = fs.readFileSync(file, 'utf8');

const targetCancel = `
      t.set(ambassadorRef, {
        totalSales: FieldValue.increment(-amount),
        totalCommission: FieldValue.increment(-commissionAmount),
        validatedCommission: FieldValue.increment(-decrementValidated),
        pendingCommission: FieldValue.increment(-decrementPending),
        paidCommission: FieldValue.increment(-decrementPaid)
      }, { merge: true });
`;

const replaceCancel = `
      t.set(ambassadorRef, {
        totalSales: FieldValue.increment(-amount),
        totalCommission: FieldValue.increment(-commissionAmount),
        validatedCommission: FieldValue.increment(-decrementValidated),
        pendingCommission: FieldValue.increment(-decrementPending),
        paidCommission: FieldValue.increment(-decrementPaid)
      }, { merge: true });

      // PHASE 5: Cancel from Wallet
      if (oldStatus === 'validated') {
        const walletRef = adminDb.collection('wallets').doc(data!.ambassadorUid);
        const walletDoc = await t.get(walletRef);
        if (walletDoc.exists) {
            t.update(walletRef, {
                availableBalance: FieldValue.increment(-commissionAmount),
                totalEarned: FieldValue.increment(-commissionAmount),
                updatedAt: FieldValue.serverTimestamp()
            });
        }
        
        const walletLogRef = adminDb.collection('wallet_logs').doc();
        t.set(walletLogRef, {
            walletId: data!.ambassadorUid,
            ambassadorUid: data!.ambassadorUid,
            type: 'cancellation',
            description: 'Annulation de commission',
            amount: -commissionAmount,
            status: 'completed',
            reference: commissionId,
            origin: 'system',
            createdAt: FieldValue.serverTimestamp()
        });
      }
`;

if (code.includes('PHASE 5') && !code.includes('PHASE 5: Cancel')) {
    code = code.replace(targetCancel, replaceCancel);
    fs.writeFileSync(file, code);
    console.log("Patched cancel logic");
} else {
    console.log("Not patched or already done");
}
