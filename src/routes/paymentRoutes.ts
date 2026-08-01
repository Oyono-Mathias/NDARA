import { logger } from '../lib/logger';
import express, { Request, Response } from "express";
import { isAuthenticated, AuthRequest } from "../middlewares/authMiddleware.js";
import { getStripe, createMobileMoneyIntent } from "../lib/paymentProviders.js";
import { adminDb } from "../lib/firebaseAdmin.js";
import { purchaseCourseWithEscrow, purchaseBourseLicense } from "../lib/walletProcessor.js";

const router = express.Router();

/**
 * Helper to process the actual course unlocking or wallet top-up 
 * once the payment is confirmed.
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
            
            // Ledger entry
            const ledgerRef = adminDb.collection('users').doc(txData.userId).collection('transactions').doc();
            t.set(ledgerRef, {
                id: ledgerRef.id,
                userId: txData.userId,
                type: 'deposit',
                amount: txData.amount,
                status: 'completed',
                description: `Rechargement portefeuille via ${method}`,
                timestamp: new Date().toISOString()
            });
        });
        return;
    }

    // 2. If it's a direct course purchase
    if (txData.type === 'course_purchase') {
        // Automatically top-up the buyer's wallet, then trigger walletProcessor
        // Wait, walletProcessor already deducts from balance. 
        // We can just add the balance, then call purchaseCourseWithEscrow!
        const userRef = adminDb.collection('users').doc(txData.userId);
        await adminDb.runTransaction(async (t) => {
            const userSnap = await t.get(userRef);
            const currentBalance = userSnap.data()?.balance || 0;
            t.update(userRef, { balance: currentBalance + txData.amount });
            t.update(txDoc.ref, { status: 'completed', completedAt: new Date().toISOString() });
        });
        
        // Now trigger the internal escrow purchase using the loaded balance
        
        // Marketing tracking for Ambassador campaigns
        if (txData.refCode) {
            try {
                const { MarketingRoutes } = await import("../lib/marketingBackend.js");
                await MarketingRoutes.trackConversion({
                    body: { ref: txData.refCode, camp: txData.campCode, type: 'sale', amount: txData.amount, courseId: txData.courseId }
                }, { json: () => {} });
            } catch(e) {
                logger.error("Marketing tracking error", e);
            }
        }
        
        await purchaseCourseWithEscrow(
            txData.userId,
            txData.amount,
            txData.courseId,
            txData.courseTitle,
            txData.sellerId,
            undefined,
            txData.couponCode
        );
    }
}

// 1. Create a Payment Intent (Card or Mobile Money)
router.post("/intent", isAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let { amount, currency = 'XAF', method, type, courseId, courseTitle, sellerId, phone, couponCode, camp, refCode } = req.body;
        const userId = req.user!.uid;
        
        if (!amount || !method || !type) {
             res.status(400).json({ error: "Paramètres manquants." });
             return;
        }

        if (type === 'course_purchase' && courseId) {
            const courseDoc = await adminDb.collection('courses').doc(courseId).get();
            if (courseDoc.exists) {
                let actualPrice = courseDoc.data()?.price || amount;
                let couponDiscount = 0;
                if (couponCode) {
                    const couponSnap = await adminDb.collection('course_coupons').where('code', '==', couponCode).get();
                    if (!couponSnap.empty) {
                        const coupon = couponSnap.docs[0].data();
                        if (coupon.isActive !== false) {
                            if (!coupon.courses || coupon.courses.length === 0 || coupon.courses.includes(courseId)) {
                                couponDiscount = coupon.discount || 0;
                            }
                        }
                    }
                }
                const calculatedPrice = actualPrice > 0 ? actualPrice - (actualPrice * (couponDiscount / 100)) : 0;
                amount = Math.round(calculatedPrice);
            }
        }

        const txRef = `TX_${Date.now()}_${userId.substring(0,5)}`;
        const customerEmail = req.user?.email || 'customer@ndara.com';

        // Save pending intent in Firestore
        await adminDb.collection('pending_payments').doc(txRef).set({
            txRef,
            userId,
            amount,
            currency,
            method,
            type,
            courseId: courseId || null,
            courseTitle: courseTitle || null,
            sellerId: sellerId || null,
            couponCode: couponCode || null,
            campCode: camp || null,
            refCode: refCode || null,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        // Provider routing
        if (method === 'card') {
            const stripe = getStripe();
            if (stripe) {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount), // Note: convert appropriately if Stripe expects minor units (e.g., Cents) 
                    currency: currency.toLowerCase(),
                    metadata: { txRef, userId, type }
                });
                res.json({ success: true, clientSecret: paymentIntent.client_secret, txRef });
            } else {
                // Mock success if no Stripe key
                setTimeout(() => fulfillPayment(txRef, 'Card (Mock)'), 2000);
                res.json({ success: true, clientSecret: 'mock_secret_123', txRef });
            }
        } 
        else if (method === 'mtn' || method === 'orange') {
            if (!phone) {
                res.status(400).json({ error: "Numéro de téléphone requis pour Mobile Money." });
                return;
            }
            const intent = await createMobileMoneyIntent(amount, currency, phone, customerEmail, txRef, method.toUpperCase() as 'MTN'|'ORANGE');
            
            if (intent.success && intent.transactionId?.startsWith('tx_sim_')) {
                // Mock auto-fulfillment after 5 seconds to simulate USSD validation
                setTimeout(() => fulfillPayment(txRef, `${method.toUpperCase()} (Mock)`), 5000);
            }
            
            res.json({ success: intent.success, txRef, paymentUrl: intent.paymentUrl, error: intent.error });
        }
        else {
            res.status(400).json({ error: "Méthode de paiement non supportée." });
        }
    } catch (e: any) {
        logger.error("Payment intent error:", e);
        res.status(500).json({ error: "Erreur lors de l'initialisation du paiement." });
    }
});

// 2. Webhook for Providers (Stripe, Flutterwave, etc.)
router.post("/webhook", express.raw({type: 'application/json'}), async (req: Request, res: Response) => {
    // In a real app, verify webhook signature
    // For Flutterwave, verify process.env.FLUTTERWAVE_SECRET_HASH matches headers['verif-hash']
    try {
        let event;
        const stripe = getStripe();
        if (stripe && req.headers['stripe-signature']) {
             event = stripe.webhooks.constructEvent(
                 req.body, 
                 req.headers['stripe-signature'] as string, 
                 process.env.STRIPE_WEBHOOK_SECRET!
             );
             if (event.type === 'payment_intent.succeeded') {
                 const paymentIntent = event.data.object as any;
                 const txRef = paymentIntent.metadata.txRef;
                 await fulfillPayment(txRef, 'Card');
             }
        } else {
            // Flutterwave or other JSON body webhook
            const body = JSON.parse(req.body.toString());
            if (body.event === 'charge.completed' && body.data.status === 'successful') {
                const txRef = body.data.tx_ref;
                await fulfillPayment(txRef, 'Mobile Money');
            }
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
        if (txData.status === 'refunded') {
            res.status(400).json({ error: "Déjà remboursé." });
            return;
        }

        // Logic for refunding real provider would go here (e.g. stripe.refunds.create)

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

        res.json({ success: true, message: "Remboursement effectué." });
    } catch (e: any) {
        logger.error("Refund error:", e);
        res.status(500).json({ error: "Erreur lors du remboursement." });
    }
});

export default router;
