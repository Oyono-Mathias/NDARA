export async function downloadVideoForOffline(
  videoId: string, 
  cdnHostname: string, 
  onProgress?: (progress: number) => void
) {
  try {
    const baseUrl = `https://${cdnHostname}/${videoId}`;
    const masterPlaylistUrl = `${baseUrl}/playlist.m3u8`;

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return new Promise((resolve, reject) => {
            // Listen for progress from SW
            const messageHandler = (event: MessageEvent) => {
                if (event.data?.type === 'PREFETCH_PROGRESS' && event.data?.videoId === videoId) {
                    if (onProgress) {
                        onProgress(event.data.progress);
                    }
                    if (event.data.progress >= 100) {
                        navigator.serviceWorker.removeEventListener('message', messageHandler);
                        resolve(true);
                    }
                } else if (event.data?.type === 'PREFETCH_ERROR' && event.data?.videoId === videoId) {
                    console.error("SW Prefetch Error:", event.data.error);
                    navigator.serviceWorker.removeEventListener('message', messageHandler);
                    reject(new Error(event.data.error));
                }
            };
            
            navigator.serviceWorker.addEventListener('message', messageHandler);

            // Send message to Service Worker to start background prefetch
            navigator.serviceWorker.controller?.postMessage({
                type: 'PREFETCH_VIDEO',
                url: masterPlaylistUrl,
                videoId: videoId
            });
        });
    } else {
        throw new Error("Service Worker not active or not supported");
    }
  } catch (error) {
    console.error("Initiation du téléchargement de la vidéo a échoué", error);
    throw error;
  }
}
