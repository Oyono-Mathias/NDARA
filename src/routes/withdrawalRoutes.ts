import { Router } from "express";
import { adminDb, admin } from "../lib/firebaseAdmin.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const FieldValue = admin.firestore.FieldValue;

router.post("/request", isAuthenticated, async (req: any, res: any) => {
    try {
        const { amount, paymentMethod, paymentAccount } = req.body;
        const ambassadorUid = req.user.uid;

        if (!amount || amount < 5000) {
            return res.status(400).json({ error: "Le montant minimum est de 5000 XAF" });
        }
        if (!paymentMethod || !paymentAccount) {
            return res.status(400).json({ error: "Méthode de paiement invalide" });
        }

        // Run transaction
        const walletRef = adminDb.collection("wallets").doc(ambassadorUid);
        const ambRef = adminDb.collection("ambassadors").doc(ambassadorUid);
        const userRef = adminDb.collection("users").doc(ambassadorUid);
        
        await adminDb.runTransaction(async (t) => {
            const walletDoc = await t.get(walletRef);
            const ambDoc = await t.get(ambRef);
            const userDoc = await t.get(userRef);

            if (!walletDoc.exists) {
                throw new Error("Portefeuille introuvable");
            }
            if (ambDoc.data()?.status !== 'active') {
                throw new Error("Compte ambassadeur inactif ou suspendu");
            }
            // Phase 9: KYC Enforcement
            if (userDoc.data()?.kycStatus !== 'approved') { 
                 throw new Error("KYC non validé. Veuillez faire vérifier votre identité avant de demander un retrait.");
            }

            const walletData = walletDoc.data()!;
            if (walletData.availableBalance < amount) {
                throw new Error("Solde disponible insuffisant");
            }

            // Check if there is already a pending withdrawal to avoid spam
            const pendingReqs = await adminDb.collection("withdraw_requests")
                .where("userId", "==", ambassadorUid)
                .where("status", "==", "pending")
                .get();
            
            if (!pendingReqs.empty) {
                throw new Error("Vous avez déjà une demande de retrait en attente.");
            }

            // Create withdraw request
            const withdrawId = adminDb.collection("withdraw_requests").doc().id;
            const withdrawRef = adminDb.collection("withdraw_requests").doc(withdrawId);

            t.set(withdrawRef, {
                id: withdrawId,
                userId: ambassadorUid,
                amount: amount,
                currency: "XAF",
                paymentMethod,
                paymentAccount,
                status: "pending",
                createdAt: FieldValue.serverTimestamp(),
                reference: `WD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
            });

            // Block funds in wallet
            t.update(walletRef, {
                availableBalance: FieldValue.increment(-amount),
                pendingWithdrawalBalance: FieldValue.increment(amount),
                updatedAt: FieldValue.serverTimestamp()
            });

            // Log wallet history
            const historyRef = adminDb.collection("wallet_history").doc();
            t.set(historyRef, {
                walletId: ambassadorUid,
                ambassadorId: ambassadorUid,
                type: "withdrawal_request",
                amount: -amount,
                currency: "XAF",
                status: "pending",
                referenceId: withdrawId,
                description: `Demande de retrait via ${paymentMethod}`,
                createdAt: FieldValue.serverTimestamp()
            });

            // Notification
            const notifRef = adminDb.collection("notifications").doc();
            t.set(notifRef, {
                userId: ambassadorUid,
                title: "Demande de retrait reçue",
                message: `Votre demande de retrait de ${amount} XAF est en cours de traitement.`,
                type: "withdrawal",
                isRead: false,
                createdAt: FieldValue.serverTimestamp()
            });
        });

        // Email could be sent asynchronously
        res.json({ success: true, message: "Demande de retrait envoyée" });
    } catch (error: any) {
        console.error("Withdrawal error:", error);
        res.status(400).json({ error: error.message });
    }
});


router.post("/admin/action", isAuthenticated, async (req: any, res: any) => {
    try {
        const { requestId, action, reason } = req.body;
        const adminUid = req.user.uid;

        const adminDoc = await adminDb.collection("users").doc(adminUid).get();
        if (adminDoc.data()?.role !== 'admin' && adminDoc.data()?.role !== 'superadmin') {
            return res.status(403).json({ error: "Accès refusé" });
        }

        const requestRef = adminDb.collection("withdraw_requests").doc(requestId);
        
        await adminDb.runTransaction(async (t) => {
            const reqDoc = await t.get(requestRef);
            if (!reqDoc.exists) throw new Error("Demande introuvable");
            
            const reqData = reqDoc.data()!;
            const ambassadorUid = reqData.userId;
            const amount = reqData.amount;
            const walletRef = adminDb.collection("wallets").doc(ambassadorUid);

            if (action === 'approve' && reqData.status === 'pending') {
                t.update(requestRef, {
                    status: 'approved',
                    validatedAt: FieldValue.serverTimestamp(),
                    adminId: adminUid
                });
                // Wallet remains blocked in pendingWithdrawalBalance
                
                // Audit log
                const logRef = adminDb.collection('withdraw_logs').doc();
                t.set(logRef, {
                    date: FieldValue.serverTimestamp(),
                    admin: adminUid,
                    action: 'approve',
                    old_value: 'pending',
                    new_value: 'approved',
                    requestId,
                    ip: req.ip,
                    device: req.headers['user-agent']
                });

                // Notif
                t.set(adminDb.collection('notifications').doc(), {
                    userId: ambassadorUid,
                    title: "Retrait approuvé",
                    message: `Votre retrait de ${amount} XAF a été approuvé et est en cours de paiement.`,
                    type: "withdrawal_approved",
                    isRead: false,
                    createdAt: FieldValue.serverTimestamp()
                });
            } else if (action === 'pay' && (reqData.status === 'approved' || reqData.status === 'pending')) {
                t.update(requestRef, {
                    status: 'paid',
                    paidAt: FieldValue.serverTimestamp(),
                    adminId: adminUid
                });
                
                // Deduct from pendingWithdrawalBalance
                t.update(walletRef, {
                    pendingWithdrawalBalance: FieldValue.increment(-amount),
                    totalWithdrawn: FieldValue.increment(amount),
                    updatedAt: FieldValue.serverTimestamp()
                });

                // History update to completed
                t.set(adminDb.collection("wallet_history").doc(), {
                    walletId: ambassadorUid,
                    ambassadorId: ambassadorUid,
                    type: "withdrawal_completed",
                    amount: 0, // already deducted during request, this is just a status update log
                    currency: "XAF",
                    status: "completed",
                    referenceId: requestId,
                    description: `Retrait de ${amount} XAF payé`,
                    createdAt: FieldValue.serverTimestamp()
                });

                // Stats
                t.set(adminDb.collection("affiliate_statistics").doc(ambassadorUid), {
                    totalWithdrawn: FieldValue.increment(amount),
                    updatedAt: FieldValue.serverTimestamp()
                }, { merge: true });

                const logRef = adminDb.collection('withdraw_logs').doc();
                t.set(logRef, {
                    date: FieldValue.serverTimestamp(),
                    admin: adminUid,
                    action: 'pay',
                    old_value: reqData.status,
                    new_value: 'paid',
                    requestId,
                    ip: req.ip,
                    device: req.headers['user-agent']
                });

                t.set(adminDb.collection('notifications').doc(), {
                    userId: ambassadorUid,
                    title: "Retrait payé",
                    message: `Votre retrait de ${amount} XAF a été transféré avec succès.`,
                    type: "withdrawal_paid",
                    isRead: false,
                    createdAt: FieldValue.serverTimestamp()
                });
            } else if (action === 'reject' && (reqData.status === 'pending' || reqData.status === 'approved')) {
                t.update(requestRef, {
                    status: 'rejected',
                    cancelledAt: FieldValue.serverTimestamp(),
                    adminId: adminUid,
                    reason: reason || "Refusé par l'administration"
                });
                
                // Refund to availableBalance
                t.update(walletRef, {
                    pendingWithdrawalBalance: FieldValue.increment(-amount),
                    availableBalance: FieldValue.increment(amount),
                    updatedAt: FieldValue.serverTimestamp()
                });

                t.set(adminDb.collection("wallet_history").doc(), {
                    walletId: ambassadorUid,
                    ambassadorId: ambassadorUid,
                    type: "withdrawal_rejected",
                    amount: amount,
                    currency: "XAF",
                    status: "completed",
                    referenceId: requestId,
                    description: `Retrait refusé : remboursement de ${amount} XAF`,
                    createdAt: FieldValue.serverTimestamp()
                });

                const logRef = adminDb.collection('withdraw_logs').doc();
                t.set(logRef, {
                    date: FieldValue.serverTimestamp(),
                    admin: adminUid,
                    action: 'reject',
                    old_value: reqData.status,
                    new_value: 'rejected',
                    reason,
                    requestId,
                    ip: req.ip,
                    device: req.headers['user-agent']
                });

                t.set(adminDb.collection('notifications').doc(), {
                    userId: ambassadorUid,
                    title: "Retrait refusé",
                    message: `Votre demande de retrait de ${amount} XAF a été refusée. Motif : ${reason || 'Non spécifié'}`,
                    type: "withdrawal_rejected",
                    isRead: false,
                    createdAt: FieldValue.serverTimestamp()
                });
            } else {
                throw new Error("Action invalide pour l'état de cette demande");
            }
        });

        res.json({ success: true, message: "Action effectuée avec succès" });
    } catch (error: any) {
        console.error("Admin withdrawal action error:", error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
