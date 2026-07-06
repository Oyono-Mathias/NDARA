import express, { Request, Response } from "express";
import { isAuthenticated, AuthRequest } from "../middlewares/authMiddleware.js";
import { adminDb } from "../lib/firebaseAdmin.js";
import crypto from "crypto";

const router = express.Router();

/**
 * 1. Génération Automatique des Licences (DRM)
 * Permet de générer une licence unique rattachée à un achat (Ebook/Template)
 */
router.post("/licenses/generate", isAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { purchaseId, productId, type } = req.body;
        const userId = req.user!.uid;

        // 1. Verify the purchase belongs to the user
        const purchaseDoc = await adminDb.collection("purchases").doc(purchaseId).get();
        if (!purchaseDoc.exists || purchaseDoc.data()?.userId !== userId) {
            res.status(403).json({ error: "Achat introuvable ou non autorisé." });
            return;
        }

        // 2. Generate a secure cryptographic license key (DRM)
        const licenseKey = crypto.randomBytes(16).toString('hex').toUpperCase();
        
        // 3. Save the license
        const licenseRef = adminDb.collection("digital_licenses").doc();
        await licenseRef.set({
            licenseId: licenseRef.id,
            purchaseId,
            productId,
            userId,
            type: type || 'ebook', // ebook or template
            licenseKey,
            status: "active",
            deviceLimit: 3,
            devicesUsed: 0,
            issuedAt: new Date().toISOString()
        });

        res.json({ success: true, license: { id: licenseRef.id, licenseKey } });
    } catch (e: any) {
        console.error("License generation error:", e);
        res.status(500).json({ error: "Erreur lors de la génération de la licence." });
    }
});

/**
 * 2. Téléchargements Sécurisés (Secure Downloads)
 * Valide la licence et retourne une URL signée ou le fichier directement.
 */
router.post("/download", isAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { licenseKey, productId } = req.body;
        const userId = req.user!.uid;

        // 1. Verify License (DRM Check)
        const licensesQuery = await adminDb.collection("digital_licenses")
            .where("licenseKey", "==", licenseKey)
            .where("userId", "==", userId)
            .where("productId", "==", productId)
            .where("status", "==", "active")
            .get();

        if (licensesQuery.empty) {
            res.status(403).json({ error: "Licence DRM invalide ou révoquée." });
            return;
        }

        const licenseDoc = licensesQuery.docs[0];
        const licenseData = licenseDoc.data();

        // 2. DRM Policy: Check device limits
        if (licenseData.devicesUsed >= licenseData.deviceLimit) {
             res.status(403).json({ error: "Limite d'appareils atteinte pour cette licence." });
             return;
        }

        // Update usage count (audit)
        await licenseDoc.ref.update({
            devicesUsed: (licenseData.devicesUsed || 0) + 1,
            lastAccessed: new Date().toISOString()
        });

        // 3. Provide Secure Download Link (Mocked URL for implementation since real storage is abstract here)
        // In reality, this would fetch from S3 / R2 using a signed URL.
        const secureDownloadUrl = `https://cdn.ndara.io/secure/deliver/${productId}?sig=${crypto.randomBytes(8).toString('hex')}`;

        res.json({ success: true, downloadUrl: secureDownloadUrl, message: "Licence validée. Téléchargement autorisé." });
    } catch (e: any) {
        console.error("Secure download error:", e);
        res.status(500).json({ error: "Erreur lors du téléchargement sécurisé." });
    }
});

export default router;
