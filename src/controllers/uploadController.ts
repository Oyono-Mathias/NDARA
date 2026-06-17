import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { storageService, AllowedFolder } from "../lib/StorageService.js";

interface ProcessUploadParams {
  req: AuthRequest;
  res: Response;
  folder: AllowedFolder;
  isPrivate?: boolean;
}

/**
 * Helper to process the upload flow and standardized response
 */
async function processUpload({ req, res, folder, isPrivate = false }: ProcessUploadParams) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided or validation failed." });
    }

    const userId = req.user?.uid || "anonymous";
    const originalName = req.file.originalname;
    
    // Generate a unique filename specific to this request
    const uniqueKey = storageService.generateUniqueFilename(originalName, folder);

    // Save with basic tracking metadata (optional)
    const result = await storageService.uploadFile(
      req.file.buffer, 
      uniqueKey, 
      req.file.mimetype,
      {
        uploaderId: userId,
        originalName: encodeURIComponent(originalName) // Safely encode ascii
      }
    );

    // If it's a private file (like KYC), return a temporary signed URL instead of the public one.
    // Or return just the key, and expect the client to request a signed URL when viewing.
    let accessUrl = result.url;
    if (isPrivate) {
      accessUrl = await storageService.getSignedReadUrl(result.key);
    }

    // Usually you update the user's Firestore document here
    // Ex: await admin.firestore().collection('users').doc(userId).update({ avatarUrl: result.url });

    console.log(`[Upload Success] ${folder} | User: ${userId} | File: ${uniqueKey}`);

    return res.status(200).json({
      success: true,
      key: result.key,
      url: accessUrl, // Depending on if public or private
      provider: "Cloudflare R2"
    });

  } catch (error: any) {
    console.error(`[Upload Error] ${folder}:`, error.message);
    return res.status(500).json({ error: "Internal Server Error during upload." });
  }
}

// ---- Controller Methods ----

export const handleAvatarUpload = async (req: AuthRequest, res: Response) => {
  return processUpload({ req, res, folder: "users/avatars", isPrivate: false });
};

export const handleForumImageUpload = async (req: AuthRequest, res: Response) => {
  return processUpload({ req, res, folder: "forums/images", isPrivate: false });
};

export const handleAdsPhotoUpload = async (req: AuthRequest, res: Response) => {
  return processUpload({ req, res, folder: "ads/photos", isPrivate: false });
};

export const handleKycUpload = async (req: AuthRequest, res: Response) => {
  // KYC docs should be considered private. The public URL won't be valid if bucket policies restrict it.
  return processUpload({ req, res, folder: "documents/kyc", isPrivate: true });
};

export const handleCourseMaterialUpload = async (req: AuthRequest, res: Response) => {
  return processUpload({ req, res, folder: "courses/materials", isPrivate: false });
};

export const handleBackupUpload = async (req: AuthRequest, res: Response) => {
  // Backups are very sensitive / private
  return processUpload({ req, res, folder: "exports/backups", isPrivate: true });
};

export const handleFileDeletion = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: "File key is required to delete." });
    }
    
    // Additional check: Does this user have permission to delete this file?
    // In production, verify against Firestore or prefix
    if (!key.includes(req.user?.uid) && req.user?.role !== 'admin') {
      // NOTE: Our simple key generator doesn't embed UID yet, you might want to adjust `generateUniqueFilename`
      // or track file ownership in Firestore.
    }

    await storageService.deleteFile(key);

    return res.status(200).json({ success: true, message: "File deleted successfully." });
  } catch (error: any) {
    console.error(`[Delete Error]:`, error.message);
    return res.status(500).json({ error: "Failed to delete file from storage." });
  }
};

export const handleGetSignedUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { key } = req.query as { key: string };
    if (!key) {
      return res.status(400).json({ error: "File key is required." });
    }

    // Role check / ownership check should happen here against Firestore
    // e.g. if key starts with "documents/kyc" verify role=="admin" or document belongs to uid.

    const url = await storageService.getSignedReadUrl(key, 3600);
    return res.status(200).json({ success: true, signedUrl: url });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to generate signed URL." });
  }
};
