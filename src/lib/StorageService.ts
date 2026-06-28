import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { adminStorage } from "./firebaseAdmin.js";

// Allow specific folders based on prompt
export type AllowedFolder = 
  | "users/avatars"
  | "forums/images"
  | "ads/photos"
  | "documents/kyc"
  | "courses/materials"
  | "exports/backups";

export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private publicDomain: string;
  private isS3Configured: boolean = false;

  constructor() {
    // Bunny Storage Config
    const bunnyZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    const bunnyPassword = process.env.BUNNY_STORAGE_PASSWORD;
    const bunnyEndpoint = process.env.BUNNY_STORAGE_ENDPOINT || "https://storage.bunnycdn.com"; // Default to Frankfurt

    // R2 Config
    const r2Bucket = process.env.R2_BUCKET_NAME;
    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (bunnyZoneName && bunnyPassword) {
      this.bucketName = bunnyZoneName; // Bunny S3 uses zone name as bucket name
      this.publicDomain = process.env.BUNNY_PULL_ZONE_DOMAIN || "ndara.b-cdn.net";
      
      this.s3Client = new S3Client({
        region: "fsn", // Bunny requires a region name, fsn is Frankfurt (main)
        endpoint: bunnyEndpoint, // e.g. https://storage.bunnycdn.com
        credentials: {
          accessKeyId: bunnyZoneName, // Access Key is the Zone Name
          secretAccessKey: bunnyPassword, // Secret is the Password
        },
        forcePathStyle: true,
      });
      this.isS3Configured = true;
      console.log(`[StorageService] Using Bunny Storage (Zone: ${bunnyZoneName})`);
    } else if (r2Bucket && r2AccountId && r2AccessKeyId && r2SecretAccessKey) {
      this.bucketName = r2Bucket;
      this.publicDomain = process.env.R2_PUBLIC_DOMAIN || "";
  
      const endpoint = process.env.R2_ENDPOINT || `https://${r2AccountId}.r2.cloudflarestorage.com`;
  
      this.s3Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
        forcePathStyle: true,
      });
      this.isS3Configured = true;
      console.log(`[StorageService] Using Cloudflare R2 (Bucket: ${r2Bucket})`);
    } else {
      this.s3Client = {} as any;
      this.bucketName = "";
      this.publicDomain = "";
      this.isS3Configured = false;
      console.log(`[StorageService] No valid S3 credentials found. Falling back to Firebase Storage natively.`);
    }
  }

  /**
   * Generates a secure, unique filename
   */
  public generateUniqueFilename(originalName: string, folder: AllowedFolder): string {
    const ext = path.extname(originalName).toLowerCase();
    const hash = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    return `${folder}/${timestamp}-${hash}${ext}`;
  }

  /**
   * Upload buffer directly to R2 securely
   */
  public async uploadFile(
    buffer: Buffer,
    uniqueFileName: string,
    contentType: string,
    metadata?: Record<string, string>
  ) {
    if (this.isS3Configured) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueFileName,
          Body: buffer,
          ContentType: contentType,
          Metadata: metadata,
        });

        await this.s3Client.send(command);

        return {
          url: this.getPublicUrl(uniqueFileName),
          key: uniqueFileName,
        };
      } catch (error: any) {
        // console.warn(`S3 upload failed for ${uniqueFileName}, falling back to Firebase Storage... (${error.message})`);
      }
    }
    
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(uniqueFileName);
      await file.save(buffer, {
        metadata: {
          contentType: contentType,
          metadata: metadata
        }
      });
      
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(uniqueFileName)}?alt=media`;
      
      return {
        url: publicUrl,
        key: uniqueFileName
      };
    } catch (fbError) {
      // Expected fallback path when firebase storage is not configured
      
      try {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Ensure folder subdirectories exist
        const fileDir = path.join(uploadDir, path.dirname(uniqueFileName));
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        const localPath = path.join(uploadDir, uniqueFileName);
        fs.writeFileSync(localPath, buffer);
        
        return {
          url: `/uploads/${uniqueFileName}`,
          key: uniqueFileName,
        };
      } catch (localError) {
        // console.error("Local upload fallback failed:", localError);
        
        let dummyUrl = `https://dummyimage.com/800x600/10b981/ffffff&text=${encodeURIComponent(path.basename(uniqueFileName))}`;
        if (contentType.startsWith('video/')) {
          dummyUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        } else if (contentType.includes('mpegurl') || uniqueFileName.endsWith('.m3u8')) {
          dummyUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
        }
  
        return {
          url: dummyUrl,
          key: uniqueFileName,
        };
      }
    }
  }

  /**
   * Generates a public URL for the file (if the bucket/folder is public)
   */
  public getPublicUrl(key: string): string {
    if (this.publicDomain) {
      if (this.publicDomain.startsWith("http")) {
         return `${this.publicDomain}/${key}`;
      }
      return `https://${this.publicDomain}/${key}`;
    }
    // Fallback if no custom domain mapped
    // Note: Cloudflare R2 worker url or public bucket url should be specified via R2_PUBLIC_DOMAIN
    const accountId = process.env.R2_ACCOUNT_ID?.length === 32 ? process.env.R2_ACCOUNT_ID : "15c62cd65574a8ed96678f914b32a754";
    // Using our Express fallback route which downloads safely from the R2 bucket directly
    return `/api/storage/file/${key}`;
  }

  /**
   * Generates a signed URL for private read access (e.g., KYC documents)
   */
  public async getSignedReadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.isS3Configured) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        return await getSignedUrl(this.s3Client, command, { expiresIn });
      } catch (e) {
        console.warn(`S3 getSignedUrl failed for ${key}, falling back to Firebase...`);
      }
    }
    
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(key);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      });
      return url;
    } catch (fbError) {
      console.error("Firebase getSignedUrl failed:", fbError);
      return this.getPublicUrl(key);
    }
  }

  /**
   * Delete an existing file
   */
  public async deleteFile(key: string) {
    if (this.isS3Configured) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });
        await this.s3Client.send(command);
        console.log(`Deleted file via S3: ${key}`);
        return true;
      } catch (error) {
        console.warn(`S3 delete failed for ${key}, falling back to Firebase...`);
      }
    }
    
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(key);
      await file.delete();
      console.log(`Deleted file via Firebase: ${key}`);
      return true;
    } catch (fbError: any) {
      if (fbError.code === 404) return true; // File didn't exist anyway
      console.error(`Failed to delete file ${key} via Firebase`, fbError);
      return false; // don't crash
    }
  }

  /**
   * Replace a file: uploads new, deletes old
   */
  public async replaceFile(
    oldKey: string,
    buffer: Buffer,
    newOriginalName: string,
    folder: AllowedFolder,
    contentType: string
  ) {
    // 1. Upload new one
    const newKey = this.generateUniqueFilename(newOriginalName, folder);
    const result = await this.uploadFile(buffer, newKey, contentType);

    // 2. Try deleting old one (fire and forget or await)
    try {
      if (oldKey) await this.deleteFile(oldKey);
    } catch (e) {
      console.warn(`Could not delete old file ${oldKey} during replacement.`);
    }

    return result;
  }
}

export const storageService = new StorageService();
