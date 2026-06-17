export const OFFLINE_STORAGE_KEY = 'edu_offline_videos';

export interface OfflineVideo {
  videoId: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  downloadedAt: number;
}

export function getOfflineVideos(): OfflineVideo[] {
  try {
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function isVideoOffline(videoId: string): boolean {
  const videos = getOfflineVideos();
  return videos.some(v => v.videoId === videoId);
}

export function saveVideoOfflineState(video: OfflineVideo) {
  const videos = getOfflineVideos();
  const exists = videos.findIndex(v => v.videoId === video.videoId);
  if (exists >= 0) {
    videos[exists] = video;
  } else {
    videos.push(video);
  }
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(videos));
}

export async function removeVideoOffline(videoId: string) {
  // 1. Supprimer l'état local
  let videos = getOfflineVideos();
  videos = videos.filter(v => v.videoId !== videoId);
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(videos));

  // 2. Supprimer les segments du Cache Storage du navigateur
  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      if (cacheName === 'bunny-video-segments' || cacheName === 'bunny-hls-playlists') {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        for (const req of requests) {
          // Si l'URL de la requête contient l'ID de la vidéo, on la supprime.
          if (req.url.includes(videoId)) {
            await cache.delete(req);
          }
        }
      }
    }
  } catch (e) {
    console.error("Erreur lors de la suppression du cache vidéo :", e);
  }
}
