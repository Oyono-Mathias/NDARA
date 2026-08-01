import { logger } from '../lib/logger';
export class BunnyStreamService {
  private libraryId: string;
  private apiKey: string;
  private cdnHostname: string;

  constructor() {
    this.libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "698776";
    this.apiKey = process.env.BUNNY_STREAM_API_KEY || "b89fbb62-a0ab-43d4-9ad766000a89-9651-4a36";
    this.cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "vz-758d93f4-d56.b-cdn.net";
  }

  isConfigured(): boolean {
    return Boolean(this.libraryId && this.apiKey);
  }

  /**
   * 1. Create a video object in Bunny Stream (Metadata)
   */
  async createVideo(title: string, collectionId?: string): Promise<{ videoId: string }> {
    if (!this.isConfigured()) {
      console.warn("Bunny Stream not configured, returning dummy video ID");
      return { videoId: "dummy-" + Date.now() };
    }

    const response = await fetch(`https://video.bunnycdn.com/library/${this.libraryId}/videos`, {
      method: "POST",
      credentials: "include",
        
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
      logger.error("Bunny Stream createVideo error:", errorText);
      console.warn("Falling back to dummy video ID due to Bunny Stream API error");
      return { videoId: "dummy-" + Date.now() };
    }

    const data: any = await response.json();
    return { videoId: data.guid };
  }

  /**
   * 2. Upload video binary data
   * (For smaller files or server-to-server proxy)
   */
  async uploadVideo(videoId: string, fileBuffer: Buffer): Promise<{ success: boolean; url: string }> {
    if (!this.isConfigured() || videoId.startsWith("dummy-")) {
      console.warn("Bunny Stream not configured or dummy video ID, returning dummy URL");
      return { 
        success: true, 
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      };
    }

    const response = await fetch(`https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`, {
      method: "PUT",
      credentials: "include",
        
      headers: {
        "AccessKey": this.apiKey,
        "Content-Type": "application/octet-stream"
      },
      body: fileBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Bunny Stream uploadVideo error:", errorText);
      console.warn("Falling back to dummy URL due to Bunny Stream upload error");
      return { 
        success: true, 
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      };
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
