const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
  app.post("/api/ambassador/admin/commission-action", isAuthenticated, async (req: any, res: any) => {
    try {
      const { commissionId, action } = req.body;
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const FieldValue = (await import("./src/lib/firebaseAdmin.js")).admin.firestore.FieldValue;
      
      const adminDoc = await adminDb.collection('users').doc(req.user.uid).get();
      if (adminDoc.data()?.role !== 'admin' && adminDoc.data()?.role !== 'superadmin') {
        return res.status(403).json({ error: "Accès refusé" });
      }

      if (action === 'cancel') {
        const { cancelAmbassadorCommission } = await import("./src/lib/commissionEngine.js");
        const result = await cancelAmbassadorCommission(commissionId);
        if (!result?.success) return res.status(400).json({ error: result?.reason });
      } else {
        // validate or pay
        const commissionRef = adminDb.collection('affiliate_transactions').doc(commissionId);
        await adminDb.runTransaction(async (t) => {
            const commDoc = await t.get(commissionRef);
            if (!commDoc.exists) throw new Error("Commission not found");
            const data = commDoc.data();
            const ambassadorUid = data.ambassadorId;
            const amount = data.commission;
            
            if (action === 'validate' && data.status === 'pending') {
                t.update(commissionRef, { status: 'validated', validatedAt: FieldValue.serverTimestamp() });
                
                const statsRef = adminDb.collection('affiliate_statistics').doc(ambassadorUid);
                t.update(statsRef, {
                    pendingCommission: FieldValue.increment(-amount),
                    validatedCommission: FieldValue.increment(amount),
                    updatedAt: FieldValue.serverTimestamp()
                });
                
                // Add to wallet available balance
                const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
                t.update(walletRef, {
                    availableBalance: FieldValue.increment(amount),
                    pendingBalance: FieldValue.increment(-amount),
                    updatedAt: FieldValue.serverTimestamp()
                });
                
                const walletHistoryRef = adminDb.collection('wallet_history').doc();
                t.set(walletHistoryRef, {
                    walletId: ambassadorUid,
                    ambassadorId: ambassadorUid,
                    type: 'commission_validated',
                    amount: amount,
                    currency: 'XAF',
                    status: 'completed',
                    referenceId: commissionId,
                    description: \`Validation de commission\`,
                    createdAt: FieldValue.serverTimestamp()
                });
            } else if (action === 'pay' && data.status === 'validated') {
                t.update(commissionRef, { status: 'paid', paidAt: FieldValue.serverTimestamp() });
                
                const statsRef = adminDb.collection('affiliate_statistics').doc(ambassadorUid);
                t.update(statsRef, {
                    validatedCommission: FieldValue.increment(-amount),
                    paidCommission: FieldValue.increment(amount),
                    updatedAt: FieldValue.serverTimestamp()
                });
                
                // Deduct from available, add to total withdrawn (wait, they withdrew it)
                const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
                t.update(walletRef, {
                    availableBalance: FieldValue.increment(-amount),
                    totalWithdrawn: FieldValue.increment(amount),
                    updatedAt: FieldValue.serverTimestamp()
                });
                
                const walletHistoryRef = adminDb.collection('wallet_history').doc();
                t.set(walletHistoryRef, {
                    walletId: ambassadorUid,
                    ambassadorId: ambassadorUid,
                    type: 'commission_paid',
                    amount: -amount,
                    currency: 'XAF',
                    status: 'completed',
                    referenceId: commissionId,
                    description: \`Paiement de commission\`,
                    createdAt: FieldValue.serverTimestamp()
                });
            }
        });
      }
      
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Erreur serveur" });
    }
  });
`;

if (!code.includes('/api/ambassador/admin/commission-action')) {
  code = code.replace('app.get("/api/ambassador/validate",', newRoute + '\n  app.get("/api/ambassador/validate",');
  fs.writeFileSync('server.ts', code);
}
