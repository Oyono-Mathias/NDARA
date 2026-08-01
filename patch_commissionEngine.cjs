const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/lib/commissionEngine.ts');
let code = fs.readFileSync(file, 'utf8');

// Find the spot where ambassadorRef is updated
const target = `
      // 6. Update ambassador stats
      t.set(ambassadorRef, {
        totalSales: FieldValue.increment(amount),
        totalCommission: FieldValue.increment(commissionAmount),
        validatedCommission: FieldValue.increment(commissionAmount)
      }, { merge: true });
`;

const replacement = `
      // 6. Update ambassador stats
      t.set(ambassadorRef, {
        totalSales: FieldValue.increment(amount),
        totalCommission: FieldValue.increment(commissionAmount),
        validatedCommission: FieldValue.increment(commissionAmount)
      }, { merge: true });

      // PHASE 5: Sync to Ambassador Wallet
      const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
      const walletDoc = await t.get(walletRef);
      if (!walletDoc.exists) {
        t.set(walletRef, {
          walletId: ambassadorUid,
          ambassadorUid: ambassadorUid,
          availableBalance: commissionAmount,
          pendingBalance: 0,
          paidBalance: 0,
          totalEarned: commissionAmount,
          totalWithdrawn: 0,
          totalPendingWithdrawals: 0,
          currency: 'XAF',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      } else {
        t.update(walletRef, {
          availableBalance: FieldValue.increment(commissionAmount),
          totalEarned: FieldValue.increment(commissionAmount),
          updatedAt: FieldValue.serverTimestamp()
        });
      }

      // Log wallet transaction
      const walletLogRef = adminDb.collection('wallet_logs').doc();
      t.set(walletLogRef, {
        walletId: ambassadorUid,
        ambassadorUid: ambassadorUid,
        type: 'commission',
        description: 'Commission sur vente ' + source,
        amount: commissionAmount,
        status: 'completed',
        reference: transactionId,
        origin: source,
        createdAt: FieldValue.serverTimestamp()
      });
`;

if (!code.includes('PHASE 5')) {
    code = code.replace(target, replacement);
    fs.writeFileSync(file, code);
    console.log("Patched commissionEngine.ts for Phase 5 wallet");
} else {
    console.log("Already patched");
}
