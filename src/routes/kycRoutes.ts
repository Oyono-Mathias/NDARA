import { Router } from "express";
import { adminDb, admin } from "../lib/firebaseAdmin.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = Router();
const FieldValue = admin.firestore.FieldValue;

router.post("/submit", isAuthenticated, async (req: any, res: any) => {
    try {
        const { documentStoragePath, documentFileName, idType } = req.body;
        const uid = req.user.uid;

        if (!documentStoragePath || !idType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const userRef = adminDb.collection("users").doc(uid);
        
        await adminDb.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) throw new Error("User not found");
            
            const kycStatus = userDoc.data()?.kycStatus;
            if (kycStatus === "pending") {
                throw new Error("You already have a pending KYC request.");
            }
            if (kycStatus === "approved") {
                throw new Error("Your KYC is already approved.");
            }

            // Create KYC request
            const kycRef = adminDb.collection("kyc_requests").doc();
            t.set(kycRef, {
                requestId: kycRef.id,
                userId: uid,
                idType,
                documentStoragePath,
                documentFileName: documentFileName || "Document",
                status: "pending",
                submittedAt: FieldValue.serverTimestamp()
            });

            // Update User
            t.update(userRef, {
                kycStatus: "pending",
                kycSubmittedAt: FieldValue.serverTimestamp()
            });
        });

        res.json({ success: true, message: "KYC submitted successfully" });
    } catch (error: any) {
        console.error("KYC Submit error:", error);
        res.status(400).json({ error: error.message });
    }
});

router.post("/admin/review", isAuthenticated, async (req: any, res: any) => {
    try {
        const { requestId, action, reason } = req.body;
        const adminUid = req.user.uid;

        const adminDoc = await adminDb.collection("users").doc(adminUid).get();
        if (adminDoc.data()?.role !== "admin" && adminDoc.data()?.role !== "superadmin") {
            return res.status(403).json({ error: "Forbidden" });
        }

        if (action === "reject" && !reason) {
            return res.status(400).json({ error: "Rejection reason is required." });
        }

        const requestRef = adminDb.collection("kyc_requests").doc(requestId);

        await adminDb.runTransaction(async (t) => {
            const reqDoc = await t.get(requestRef);
            if (!reqDoc.exists) throw new Error("KYC request not found");
            
            const reqData = reqDoc.data()!;
            if (reqData.status !== "pending") throw new Error("KYC request is not pending");

            const userId = reqData.userId;
            const userRef = adminDb.collection("users").doc(userId);

            const newStatus = action === "approve" ? "approved" : "rejected";

            t.update(requestRef, {
                status: newStatus,
                reviewedAt: FieldValue.serverTimestamp(),
                reviewedBy: adminUid,
                rejectionReason: action === "reject" ? reason : null,
                adminNote: action === "reject" ? reason : "Approved"
            });

            t.update(userRef, {
                kycStatus: newStatus,
                kycRejectedReason: action === "reject" ? reason : null
            });

            const auditRef = adminDb.collection("security_audit_logs").doc();
            t.set(auditRef, {
                action: action === "approve" ? "KYC_APPROVED" : "KYC_REJECTED",
                userId: userId,
                adminId: adminUid,
                requestId: requestId,
                timestamp: FieldValue.serverTimestamp(),
                reason: action === "reject" ? reason : null
            });

            const notifRef = adminDb.collection("notifications").doc();
            t.set(notifRef, {
                userId,
                title: action === "approve" ? "KYC Approuvé" : "KYC Rejeté",
                message: action === "approve" ? "Votre vérification d'identité a été approuvée avec succès." : `Votre vérification d'identité a été rejetée. Motif : ${reason}`,
                type: action === "approve" ? "kyc_approved" : "kyc_rejected",
                isRead: false,
                createdAt: FieldValue.serverTimestamp()
            });
        });

        res.json({ success: true, message: `KYC ${action}d successfully` });
    } catch (error: any) {
        console.error("Admin KYC review error:", error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
