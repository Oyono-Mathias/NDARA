import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated, requireRole, AuthRequest } from "../middlewares/authMiddleware.js";
import { 
  uploadAvatar, 
  uploadForumImage, 
  uploadAdsPhoto, 
  uploadKycDoc, 
  uploadCourseMaterial,
  uploadBackup 
} from "../middlewares/uploadMiddleware.js";
import {
  handleAvatarUpload,
  handleForumImageUpload,
  handleAdsPhotoUpload,
  handleKycUpload,
  handleCourseMaterialUpload,
  handleBackupUpload,
  handleFileDeletion,
  handleGetSignedUrl
} from "../controllers/uploadController.js";

const router = Router();

// Wrapper to cast Express Request wrapper for TS
const wrapAuth = (fn: (req: AuthRequest, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthRequest, res).catch(next);
  };
};

/**
 * ----------------------------
 * 1. Public / User Uploads 
 * ----------------------------
 */

// Avatar upload (requires Auth)
router.post(
  "/avatar",
  isAuthenticated,
  uploadAvatar.single("file"),
  wrapAuth(handleAvatarUpload)
);

// Forum Image upload (requires Auth)
router.post(
  "/forum",
  isAuthenticated,
  uploadForumImage.single("file"),
  wrapAuth(handleForumImageUpload)
);

// Ads Photo upload (requires Auth)
router.post(
  "/ads",
  isAuthenticated,
  uploadAdsPhoto.single("file"),
  wrapAuth(handleAdsPhotoUpload)
);

/**
 * ----------------------------
 * 2. Sensitive Uploads (KYC)
 * ----------------------------
 */

// KYC Documents (requires Auth, maybe specific role later)
router.post(
  "/kyc",
  isAuthenticated,
  uploadKycDoc.single("file"),
  wrapAuth(handleKycUpload)
);

// Course Materials (PDFs)
router.post(
  "/materials",
  isAuthenticated,
  requireRole(["admin", "instructor"]), // Assumes you have an instructor role logic
  uploadCourseMaterial.single("file"),
  wrapAuth(handleCourseMaterialUpload)
);

/**
 * ----------------------------
 * 3. Administrative Uploads
 * ----------------------------
 */

// Backups (requires Auth & "admin" role)
router.post(
  "/backup",
  isAuthenticated,
  requireRole(["admin"]),
  uploadBackup.single("file"),
  wrapAuth(handleBackupUpload)
);

/**
 * ----------------------------
 * 4. File Management 
 * ----------------------------
 */

// Delete files
router.delete(
  "/",
  isAuthenticated, // Admin check enforced inside controller or role middleware
  wrapAuth(handleFileDeletion)
);

// Get signed URL for private files
router.get(
  "/signed-url",
  isAuthenticated, // Private files require auth to view
  wrapAuth(handleGetSignedUrl)
);

/**
 * ----------------------------
 * 5. Legacy Proxy & Multipart
 * ----------------------------
 */

import fs from "fs";
import path from "path";
import os from "os";

// 5.1 Multipart Upload Support to bypass NGINX limits
router.post(
  "/multipart/start",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileName, folder, contentType } = req.query as any;
      if (!fileName) {
        res.status(400).json({ error: "fileName required" });
        return;
      }
      const uploadId = Date.now().toString() + "-" + Math.random().toString(36).substring(7);
      const tempDir = path.join(os.tmpdir(), "ndara-uploads", uploadId);
      fs.mkdirSync(tempDir, { recursive: true });
      
      // Save metadata
      fs.writeFileSync(path.join(tempDir, "metadata.json"), JSON.stringify({
        fileName, folder, contentType
      }));

      res.json({ uploadId });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  }
);

router.put(
  "/multipart/:uploadId/chunk/:index",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uploadId, index } = req.params;
      const tempDir = path.join(os.tmpdir(), "ndara-uploads", uploadId);
      if (!fs.existsSync(tempDir)) {
        res.status(404).json({ error: "Upload session not found" });
        return;
      }
      
      const chunkPath = path.join(tempDir, `chunk-${index}`);
      const writeStream = fs.createWriteStream(chunkPath);
      req.pipe(writeStream);
      
      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(true));
        writeStream.on('error', reject);
      });

      res.json({ success: true });
    } catch (e: any) {
      console.error("Chunk error:", e);
      res.status(500).json({ error: e.message });
    }
  }
);

router.post(
  "/multipart/:uploadId/finish",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uploadId } = req.params;
      const tempDir = path.join(os.tmpdir(), "ndara-uploads", uploadId);
      
      if (!fs.existsSync(tempDir)) {
        res.status(404).json({ error: "Upload session not found" });
        return;
      }

      const metaStr = fs.readFileSync(path.join(tempDir, "metadata.json"), "utf8");
      const { fileName, folder, contentType } = JSON.parse(metaStr);

      // Merge chunks
      const files = fs.readdirSync(tempDir).filter(f => f.startsWith("chunk-"));
      files.sort((a, b) => parseInt(a.split("-")[1]) - parseInt(b.split("-")[1]));

      const finalBufferPath = path.join(tempDir, "final");
      for (const file of files) {
        const chunkData = fs.readFileSync(path.join(tempDir, file));
        fs.appendFileSync(finalBufferPath, chunkData);
      }

      const resolvedFolder = (folder as string) || "general";
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uniqueName = `${resolvedFolder}/${Date.now()}-${safeFileName}`;

      const { storageService } = await import("../lib/StorageService.js");

      // ----------------------------------------------------
      // IA STUDIO: HLS + AES-128 Encoding for course-videos
      // ----------------------------------------------------
      if (resolvedFolder === 'course-videos') {
         console.log('🎬 Starting FFmpeg HLS Encoding for:', uniqueName);
         
         const crypto = await import("crypto");
         const ffmpegStatic = await import("ffmpeg-static");
         const fluentFfmpeg = await import("fluent-ffmpeg");
         
         // We removed the Firestore "videos" document creation via backend due to AI Studio service account limitations.
         // Since this runs synchronously in the Express request, the frontend will wait until it receives the final 200 OK.

         fluentFfmpeg.default.setFfmpegPath(ffmpegStatic.default || '/usr/bin/ffmpeg');
         
         const outputDir = path.join(tempDir, "hls_output");
         fs.mkdirSync(outputDir, { recursive: true });

         // 1. Generate AES-128 Key
         const aesKey = crypto.randomBytes(16);
         const keyFilePath = path.join(outputDir, "video.key");
         const keyInfoPath = path.join(outputDir, "key_info.txt");
         fs.writeFileSync(keyFilePath, aesKey);

         // 2. Set the key URL that the player will request
         const keyUrl = `/api/storage/video-key/${uploadId}`;
         fs.writeFileSync(keyInfoPath, `${keyUrl}\n${keyFilePath}`);

         try {
           // 3. Execute FFmpeg
           await new Promise((resolve, reject) => {
              fluentFfmpeg.default(finalBufferPath)
                .addOutputOptions([
                  "-hls_time 6",
                  "-hls_key_info_file " + keyInfoPath,
                  "-hls_playlist_type vod",
                  "-hls_segment_filename " + path.join(outputDir, "segment_%03d.ts")
                ])
                .output(path.join(outputDir, "playlist.m3u8"))
                .on("end", resolve)
                .on("error", (err: any) => {
                   console.error("FFMPEG Error:", err);
                   reject(err);
                })
                .run();
           });

           // 4. Upload all HLS files to Storage (Cloudflare R2)
           const uploadedFiles = fs.readdirSync(outputDir);
           let m3u8Url = "";
           for (const file of uploadedFiles) {
              if (file === "key_info.txt") continue; // We don't upload the local path info
              
              const filePath = path.join(outputDir, file);
              const fileData = fs.readFileSync(filePath);
              
              let mimeType = "application/octet-stream";
              if (file.endsWith(".m3u8")) mimeType = "application/vnd.apple.mpegurl";
              else if (file.endsWith(".ts")) mimeType = "video/MP2T";

              const r2Path = `${resolvedFolder}/${uploadId}/${file}`;
              const resData = await storageService.uploadFile(fileData, r2Path, mimeType);
              
              if (file === "playlist.m3u8") {
                 m3u8Url = resData.url;
              }
           }

           // We removed the Firestore update.
           // You can let the frontend handle the success.

           fs.rmSync(tempDir, { recursive: true, force: true });
           res.json({ success: true, publicUrl: m3u8Url });
           return;
         } catch (ffmpegErr: any) {
           // We removed the Firestore update.
           fs.rmSync(tempDir, { recursive: true, force: true });
           throw ffmpegErr;
         }
      }
      
      // Default behavior for other files
      const finalBuffer = fs.readFileSync(finalBufferPath);
      const result = await storageService.uploadFile(finalBuffer, uniqueName, contentType || "application/octet-stream");

      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });

      res.json({ success: true, publicUrl: result.url });
    } catch (e: any) {
      console.error("Finish error:", e);
      res.status(500).json({ error: e.message });
    }
  }
);

// Endpoints for securely retrieving the video key
router.get(
  "/video-key/:uploadId",
  isAuthenticated,
  wrapAuth(async (req: AuthRequest, res: Response) => {
    try {
      const { uploadId } = req.params;
      const { storageService } = await import("../lib/StorageService.js");
      
      // Instead of reading the key data into the server memory, we stream it directly or get a signed URL.
      // But since it's just 16 bytes, we can easily fetch it and send it back as octet-stream!
      const keyPath = `course-videos/${uploadId}/video.key`;
      
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const command = new GetObjectCommand({
        Bucket: storageService["bucketName"],
        Key: keyPath,
      });
      
      const response = await storageService["s3Client"].send(command);
      
      res.set({
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-store, private',
        'Access-Control-Allow-Origin': '*', // If needed, though CORS middleware might handle it
      });

      if (response.Body) {
        (response.Body as any).pipe(res);
      } else {
        res.status(404).json({ error: "Key not found" });
      }
    } catch (error: any) {
      console.error("Key retrieval error:", error);
      res.status(404).json({ error: "Access denied or key missing" });
    }
  })
);

router.get("/file/*", async (req: Request, res: Response): Promise<void> => {
  try {
    const key = req.params[0];
    if (!key) {
      res.status(400).json({ error: "File key is required" });
      return;
    }
    const { storageService } = await import("../lib/StorageService.js");
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    
    const command = new GetObjectCommand({
      Bucket: storageService["bucketName"],
      Key: key,
      Range: req.headers.range, // Pass Client Range Header to R2
    });
    
    const response = await storageService["s3Client"].send(command);
    
    if (response.ContentType) res.setHeader("Content-Type", response.ContentType);
    if (response.ContentLength) res.setHeader("Content-Length", response.ContentLength.toString());
    if (response.CacheControl) res.setHeader("Cache-Control", response.CacheControl);
    else res.setHeader("Cache-Control", "public, max-age=31536000");

    if (response.ContentRange) {
      res.setHeader("Content-Range", response.ContentRange);
      res.status(206);
    } else if (response.AcceptRanges) {
      res.setHeader("Accept-Ranges", response.AcceptRanges);
    }
    
    if (response.Body) {
      (response.Body as any).pipe(res);
    } else {
      res.status(404).json({ error: "File empty" });
    }
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      res.status(404).json({ error: "File not found" });
    } else {
      console.error("Proxy stream error:", error);
      res.status(error.$metadata?.httpStatusCode || 500).json({ error: "Failed to read file from storage" });
    }
  }
});

// Handle raw PUT uploads from r2Upload.ts
router.put(
  "/proxy",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { fileName, folder, contentType } = req.query as any;
      if (!fileName) {
        res.status(400).json({ error: "fileName query parameter is required" });
        return;
      }

      // Collect the raw binary data
      const chunks: any[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const resolvedFolder = (folder as string) || "general";
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uniqueName = `${resolvedFolder}/${Date.now()}-${safeFileName}`;

      const { storageService } = await import("../lib/StorageService.js");
      const result = await storageService.uploadFile(buffer, uniqueName, contentType || "application/octet-stream");

      res.json({ success: true, publicUrl: result.url, provider: "Cloudflare R2" });
    } catch (error: any) {
      console.error("Storage proxy error:", error);
      res.status(500).json({ error: error.message || "Failed to proxy upload." });
    }
  }
);

/**
 * ----------------------------
 * 6. Video Integration (Phase 4: Bunny Stream Pilot Test)
 * ----------------------------
 */
import { bunnyStreamService } from "../lib/BunnyStreamService.js";

router.post(
  "/bunny/upload",
  isAuthenticated,
  requireRole(["admin", "instructor"]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, collectionId } = req.query as { title?: string, collectionId?: string };

      if (!title) {
        res.status(400).json({ error: "Title parameter is required for Bunny Stream vide." });
        return;
      }

      // 1. Create the video placeholder in Bunny Stream
      const { videoId } = await bunnyStreamService.createVideo(title, collectionId);
      
      // 2. Read the raw buffer from the request stream
      const chunks: any[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // 3. Upload the buffer to Bunny Stream
      const result = await bunnyStreamService.uploadVideo(videoId, buffer);

      res.status(200).json({
        success: true,
        videoId,
        playlistUrl: result.url,
        iframeUrl: `https://iframe.mediadelivery.net/embed/${process.env.BUNNY_STREAM_LIBRARY_ID}/${videoId}`,
        provider: "Bunny Stream (Pilot)"
      });
    } catch (error: any) {
      console.error("[Bunny Stream Pilot Upload Error]:", error);
      res.status(500).json({ error: error.message || "Failed to upload video to Bunny Stream" });
    }
  }
);

/**
 * ----------------------------
 * Shared Error Handler for Multer
 * ----------------------------
 */
// Centralized Multer Error Handling inside this router
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "MulterError") {
    // A Multer error occurred when uploading (e.g. LIMIT_FILE_SIZE).
    return res.status(413).json({ error: err.message });
  } else if (err.message && err.message.startsWith("Validation Error")) {
    // Custom logic error from uploadMiddleware
    return res.status(400).json({ error: err.message });
  }
  // Let Express default deal with other errors
  next(err);
});

export default router;
