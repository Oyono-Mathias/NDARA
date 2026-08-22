import { logger } from '../lib/logger.js';
import express, { Request, Response } from "express";
import { isAuthenticated, AuthRequest } from "../middlewares/authMiddleware.js";
import { adminDb } from "../lib/firebaseAdmin.js";
import { purchaseCourseWithEscrow, purchaseBourseLicense } from "../lib/walletProcessor.js";
import { GatewayFactory } from "../lib/payments/GatewayFactory.js";

const router = express.Router();

/**
 * Helper to process the actual course unlocking or wallet top-up 
 * once the payment is confirmed.
 * This is the CORE FINANCIAL ENGINE. Do NOT modify.
 */
async function fulfillPayment(transactionRef: string, method: string) {
    const txDoc = await adminDb.collection('pending_payments').doc(transactionRef).get();
    if (!txDoc.exists) throw new Error("Transaction not found");
    
    const txData = txDoc.data()!;
    if (txData.status === 'completed') return; // Already fulfilled

    // 1. If it's a Wallet Deposit (Top up)
    if (txData.type === 'wallet_deposit') {
        const userRef = adminDb.collection('users').doc(txData.userId);
        
        await adminDb.runTransaction(async (t) => {
            const userSnap = await t.get(userRef);
            const currentBalance = userSnap.data()?.balance || 0;
            
            t.update(userRef, { balance: currentBalance + txData.amount });
            t.update(txDoc.ref, { status: 'completed', completedAt: new Date().toISOString() });
            
            // Log to ledger
            const ledgerRef = userRef.collection('transactions').doc();
            t.set(ledgerRef, {
                id: ledgerRef.id,
                userId: txData.userId,
                type: 'deposit',
                amount: txData.amount,
                status: 'completed',
                description: `Dépôt Wallet via ${method}`,
                timestamp: new Date().toISOString()
            });
        });
        return;
    }

    // 2. If it's a License Purchase
    if (txData.type === 'license') {
        const licenseTitle = txData.licenseTier === 'PREMIUM' ? 'Licence Masterclass Premium' : 'Licence Bourse Standard';
        await purchaseBourseLicense(txData.userId, txData.amount, "BOURSE_LICENSE_01", licenseTitle);
        await adminDb.collection('pending_payments').doc(transactionRef).update({
            status: 'completed', completedAt: new Date().toISOString()
        });
        return;
    }

    // 3. Otherwise, it's a Course Purchase
    const { courseId, userId, ambassadorId } = txData;
    if (!courseId) throw new Error("Missing courseId in transaction");

    // Fetch course details for purchaseCourseWithEscrow
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) throw new Error("Course not found");
    const courseData = courseDoc.data()!;
    const sellerId = courseData.instructorId || courseData.authorId || "admin";

    // We must pass ambassadorId if it exists to properly trigger the commission engine
    await purchaseCourseWithEscrow(userId, txData.amount, courseId, courseData.title || "Formation", sellerId, ambassadorId);
    
    // Mark pending payment as completed
    await adminDb.collection('pending_payments').doc(transactionRef).update({
        status: 'completed',
        completedAt: new Date().toISOString()
    });
}


// 1. Create Payment Intent
router.post("/intent", isAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, method, courseId, type, licenseTier, phone, ambassadorId, email } = req.body;

        if (!amount || !method) {
            res.status(400).json({ error: "Montant et méthode sont requis." });
            return;
        }

        const txRef = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Save pending payment securely in backend (No frontend override allowed)
        await adminDb.collection('pending_payments').doc(txRef).set({
            txRef,
            userId: req.user!.uid,
            amount: Number(amount),
            method,
            type: type || 'course', // 'course', 'wallet_deposit', 'license'
            courseId: courseId || null,
            licenseTier: licenseTier || null,
            ambassadorId: ambassadorId || null, // Capture affiliate param securely
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        // Use the Factory to get the correct adapter (Mesomb, Stripe, Flutterwave)
        const adapter = GatewayFactory.getAdapter(method);
        
        const metadata = { courseId, type, userId: req.user!.uid };
        const customerData = { phone, email, method };

        const intent = await adapter.createIntent(Number(amount), 'XAF', txRef, metadata, customerData);

        if (intent.success) {
            res.json({ success: true, txRef, paymentUrl: intent.paymentUrl, clientSecret: intent.clientSecret, error: intent.error });
        } else {
            res.status(400).json({ error: intent.error || "Erreur de paiement" });
        }
    } catch (e: any) {
        logger.error("Payment intent error:", e);
        res.status(500).json({ error: e.message || "Erreur lors de l'initialisation du paiement." });
    }
});


// 2. Webhook for Providers (MeSomb, Stripe, Flutterwave)
router.post("/webhook", express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    try {
        const adapter = GatewayFactory.getAdapterFromWebhook(req);
        
        if (!adapter) {
            return res.status(400).send("Unknown webhook source");
        }

        const result = await adapter.verifyWebhook(req);

        if (!result.isValid) {
            return res.status(401).send("Invalid webhook signature or payload");
        }

        if (result.status === 'completed' && result.txRef) {
            const txDoc = await adminDb.collection('pending_payments').doc(result.txRef).get();
            
            if (txDoc.exists) {
                const expectedAmount = txDoc.data()!.amount;
                // SECURITY: Verify the amount matches what was stored internally
                if (result.amount && Number(result.amount) !== Number(expectedAmount)) {
                    logger.error(`Amount mismatch for ${result.txRef}. Expected ${expectedAmount}, got ${result.amount}`);
                    return res.status(400).send("Amount mismatch");
                }
                
                await fulfillPayment(result.txRef, adapter.getName());
            } else {
                logger.error(`Transaction ${result.txRef} not found in DB`);
            }
        } else if (result.status === 'failed' && result.txRef) {
            await adminDb.collection('pending_payments').doc(result.txRef).update({
                status: 'failed',
                failedAt: new Date().toISOString()
            });
        }

        res.status(200).send("Webhook received");
    } catch (err: any) {
        logger.error("Webhook Error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});


// 3. Admin Refund API
router.post("/refund", isAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { txRef, reason } = req.body;

        // Verify admin
        const adminDoc = await adminDb.collection('users').doc(req.user!.uid).get();
        if (adminDoc.data()?.role !== 'admin' && adminDoc.data()?.role !== 'superadmin') {
            res.status(403).json({ error: "Accès refusé" });
            return;
        }

        const txDoc = await adminDb.collection('pending_payments').doc(txRef).get();
        if (!txDoc.exists) {
            res.status(404).json({ error: "Transaction introuvable." });
            return;
        }

        const txData = txDoc.data()!;
        if (txData.status === 'refunded' || txData.status === 'refund_processing') {
            res.status(400).json({ error: "Remboursement déjà en cours ou effectué." });
            return;
        }

        // Lock transaction
        await adminDb.collection('pending_payments').doc(txRef).update({
            status: 'refund_processing'
        });
        
        let gatewayConfirmed = false;

        try {
            // Find the original method adapter
            const adapter = GatewayFactory.getAdapter(txData.method);
            const refundResult = await adapter.refund(txRef, txData.amount, reason);
            
            if (refundResult.success) {
                gatewayConfirmed = true;
            } else {
                throw new Error(refundResult.error || "Erreur inconnue");
            }
        } catch (err: any) {
            logger.error("Refund error via Adapter", err);
            // Revert lock
            await adminDb.collection('pending_payments').doc(txRef).update({ status: txData.status });
            res.status(500).json({ error: err.message || "Erreur lors du remboursement." });
            return;
        }

        if (!gatewayConfirmed) {
             // Revert lock
             await adminDb.collection('pending_payments').doc(txRef).update({ status: txData.status });
             res.status(500).json({ error: "Impossible de confirmer le remboursement avec le prestataire." });
             return;
        }

        // Mark as refunded internally
        await adminDb.collection('pending_payments').doc(txRef).update({
            status: 'refunded',
            refundReason: reason,
            refundedAt: new Date().toISOString()
        });

        // Write to ledger
        const ledgerRef = adminDb.collection('users').doc(txData.userId).collection('transactions').doc();
        await ledgerRef.set({
            id: ledgerRef.id,
            userId: txData.userId,
            type: 'refund',
            amount: txData.amount,
            status: 'completed',
            description: `Remboursement de la transaction ${txRef} (${reason})`,
            timestamp: new Date().toISOString()
        });
        
        // Automatic cancellation of ambassador commission if any
        try {
            const { cancelAmbassadorCommission } = await import("../lib/commissionEngine.js");
            await cancelAmbassadorCommission(txRef);
        } catch(err) {
            logger.error("Error cancelling commission on refund", err);
        }

        res.json({ success: true, message: "Remboursement effectué." });
    } catch (e: any) {
        logger.error("Refund error:", e);
        res.status(500).json({ error: "Erreur lors du remboursement." });
    }
});

export default router;
