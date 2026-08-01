import express, { Request, Response } from "express";
import { isAuthenticated, AuthRequest } from "../middlewares/authMiddleware.js";
import { purchaseCourseWithEscrow, releaseExpiredEscrows } from "../lib/walletProcessor.js";
import { logger } from "../lib/logger.js";

const router = express.Router();

router.post("/purchase", isAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { studentId, price, courseId, courseTitle, sellerId, couponCode } = req.body;
        const userId = req.user!.uid;

        if (userId !== studentId) {
             res.status(403).json({ error: "Unauthorized" });
             return;
        }

        const result = await purchaseCourseWithEscrow(
            studentId,
            price,
            courseId,
            courseTitle,
            sellerId,
            undefined, // purchaseId
            couponCode
        );

        res.json(result);
    } catch (e: any) {
        logger.error("Wallet purchase error:", e);
        res.status(500).json({ error: e.message || "Erreur lors de l'achat" });
    }
});

router.post("/release-escrows", isAuthenticated, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.uid;
        const result = await releaseExpiredEscrows(userId);
        res.json({ success: true, ...result });
    } catch (e: any) {
        logger.error("Release escrows error:", e);
        res.status(500).json({ error: e.message || "Erreur lors de la libération" });
    }
});

export default router;
