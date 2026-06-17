export class BunnyStreamService {
  private libraryId: string;
  private apiKey: string;
  private cdnHostname: string;

  constructor() {
    this.libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "";
    this.apiKey = process.env.BUNNY_STREAM_API_KEY || "";
    this.cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "";
  }

  isConfigured(): boolean {
    return Boolean(this.libraryId && this.apiKey);
  }

  /**
   * 1. Create a video object in Bunny Stream (Metadata)
   */
  async createVideo(title: string, collectionId?: string): Promise<{ videoId: string }> {
    if (!this.isConfigured()) throw new Error("Bunny Stream not configured");

    const response = await fetch(`https://video.bunnycdn.com/library/${this.libraryId}/videos`, {
      method: "POST",
      headers: {
        "AccessKey": this.apiKey,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        collectionId: collectionId || undefined
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bunny Stream createVideo error:", errorText);
      throw new Error("Failed to create video placeholder in Bunny Stream");
    }

    const data: any = await response.json();
    return { videoId: data.guid };
  }

  /**
   * 2. Upload video binary data
   * (For smaller files or server-to-server proxy)
   */
  async uploadVideo(videoId: string, fileBuffer: Buffer): Promise<{ success: boolean; url: string }> {
    if (!this.isConfigured()) throw new Error("Bunny Stream not configured");

    const response = await fetch(`https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`, {
      method: "PUT",
      headers: {
        "AccessKey": this.apiKey,
        "Content-Type": "application/octet-stream"
      },
      body: fileBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bunny Stream uploadVideo error:", errorText);
      throw new Error("Failed to upload video to Bunny Stream");
    }

    // Return the HLS playlist URL (which Bunny encodes automatically)
    // Assuming standard format: https://[cdn-hostname]/[videoId]/playlist.m3u8
    const playUrl = this.cdnHostname 
      ? `https://${this.cdnHostname}/${videoId}/playlist.m3u8`
      : `https://iframe.mediadelivery.net/play/${this.libraryId}/${videoId}`;
      
    // Iframe embed URL is usually: https://iframe.mediadelivery.net/embed/[libraryId]/[videoId]

    return { 
      success: true, 
      url: playUrl
    };
  }
}

export const bunnyStreamService = new BunnyStreamService();
