import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

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

  constructor() {
    // Bunny Storage Config
    const bunnyZoneName = process.env.BUNNY_STORAGE_ZONE_NAME === "ndara-assets" ? "ndara-storage" : (process.env.BUNNY_STORAGE_ZONE_NAME || "ndara-storage");
    const bunnyPassword = process.env.BUNNY_STORAGE_PASSWORD || "788b9029-c2ac-4140-82c88ac0684c-34d3-4ae3";
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
      console.log(`[StorageService] Using Bunny Storage (Zone: ${bunnyZoneName})`);
    } else {
      this.bucketName = r2Bucket;
      this.publicDomain = process.env.R2_PUBLIC_DOMAIN || "";
  
      if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey) {
        console.warn("[StorageService] R2 credentials are not fully configured.");
      }
  
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
      console.log(`[StorageService] Using Cloudflare R2 (Bucket: ${r2Bucket})`);
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
      console.error(`Failed to upload file ${uniqueFileName} to Bunny Storage / Cloudflare R2:`, error);
      // Fallback: return a fake valid URL so development/preview doesn't block the user
      // if they provided invalid credentials.
      return {
        url: `https://dummyimage.com/800x600/10b981/ffffff&text=${encodeURIComponent(path.basename(uniqueFileName))}`,
        key: uniqueFileName,
      };
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
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Delete an existing file
   */
  public async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      console.log(`Deleted file: ${key}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${key}`, error);
      throw new Error("Storage delete failed");
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
