const fs = require('fs');
let code = fs.readFileSync('src/routes/paymentRoutes.ts', 'utf8');

const refundHook = `
        // Write to ledger
        const ledgerRef = adminDb.collection('users').doc(txData.userId).collection('transactions').doc();
        await ledgerRef.set({
            id: ledgerRef.id,
            userId: txData.userId,
            type: 'refund',
            amount: txData.amount,
            status: 'completed',
            description: \`Remboursement de la transaction \${txRef} (\${reason})\`,
            timestamp: new Date().toISOString()
        });
        
        // Automatic cancellation of ambassador commission if any
        try {
            const { cancelAmbassadorCommission } = await import("../lib/commissionEngine.js");
            await cancelAmbassadorCommission(txRef);
        } catch(err) {
            logger.error("Error cancelling commission on refund", err);
        }
`;

if (!code.includes('cancelAmbassadorCommission(txRef)')) {
    code = code.replace(
        `        // Write to ledger
        const ledgerRef = adminDb.collection('users').doc(txData.userId).collection('transactions').doc();
        await ledgerRef.set({
            id: ledgerRef.id,
            userId: txData.userId,
            type: 'refund',
            amount: txData.amount,
            status: 'completed',
            description: \`Remboursement de la transaction \${txRef} (\${reason})\`,
            timestamp: new Date().toISOString()
        });`,
        refundHook
    );
    fs.writeFileSync('src/routes/paymentRoutes.ts', code);
}
