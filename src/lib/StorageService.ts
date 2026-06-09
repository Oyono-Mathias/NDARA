import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'ndara-bucket';

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn("Cloudflare R2 credentials are not fully configured via environment variables.");
    }

    const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
      },
    });
  }

  /**
   * Generates a secure presigned URL for direct file upload to R2
   * with automatic fallback to Bunny Storage on failure.
   */
  async generateUploadUrl(
    fileName: string,
    folder: "ebooks" | "templates" | "avatars" | string = "uploads",
    contentType: string = "application/octet-stream"
  ) {
    const timestamp = Date.now();
    const uniqueFileName = `${folder}/${timestamp}-${fileName}`;

    try {
      // Primary Attempt: Cloudflare R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFileName,
        ContentType: contentType,
      });

      // URL is valid for 15 minutes (900 seconds)
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

      const publicUrl = process.env.R2_PUBLIC_DOMAIN 
        ? `https://${process.env.R2_PUBLIC_DOMAIN}/${uniqueFileName}`
        : `${process.env.R2_ENDPOINT}/${this.bucketName}/${uniqueFileName}`;

      return {
        presignedUrl,
        publicUrl,
        uniqueFileName,
        provider: "r2",
        headers: {
          "Content-Type": contentType
        }
      };
    } catch (error) {
      // Fallback Attempt: Bunny Storage
      console.warn("R2 failed, switching to Bunny Storage...", error);

      const bunnyZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
      const bunnyApiKey = process.env.BUNNY_STORAGE_API_KEY;
      const bunnyPullZone = process.env.BUNNY_PULL_ZONE_URL;
      const bunnyEndpoint = process.env.BUNNY_STORAGE_ENDPOINT || "storage.bunnycdn.com";

      if (!bunnyZoneName || !bunnyApiKey || !bunnyPullZone) {
        throw new Error("Storage upload failed: R2 failed and Bunny Storage is not fully configured.");
      }

      const presignedUrl = `https://${bunnyEndpoint}/${bunnyZoneName}/${uniqueFileName}`;
      const publicUrl = `${bunnyPullZone}/${uniqueFileName}`;

      return {
        presignedUrl,
        publicUrl,
        uniqueFileName,
        provider: "bunny",
        headers: {
          "AccessKey": bunnyApiKey,
          "Content-Type": contentType
        }
      };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
