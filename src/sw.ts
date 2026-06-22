/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// Nettoyer les anciens caches lors d'une mise à jour
cleanupOutdatedCaches();

// Pré-mise en cache des assets statiques (Vite injectera ici la liste)
precacheAndRoute(self.__WB_MANIFEST || []);

// ----------------------------------------------------------------------------
// INTERCEPTION DES FLUX VIDÉO BUNNY STREAM
// ----------------------------------------------------------------------------

// 1. Interception des playlists HLS (.m3u8)
registerRoute(
  ({ url }) => url.hostname.includes('b-cdn.net') && url.pathname.endsWith('.m3u8'),
  new NetworkFirst({
    cacheName: 'bunny-hls-playlists',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24h
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 2. Interception des segments vidéos (.ts ou .m4s)
// C'est ici que réside la majorité de notre stratégie hors connexion
registerRoute(
  ({ url }) => url.hostname.includes('b-cdn.net') && (url.pathname.endsWith('.ts') || url.pathname.endsWith('.m4s')),
  new CacheFirst({
    cacheName: 'bunny-video-segments',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 5000, // On autorise beaucoup de segments car une vidéo peut en contenir des centaines
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours (optimisé pour les étudiants sans data)
      }),
      new CacheableResponsePlugin({
        // Status 0 est crucial pour les réponses opaques si les CORS ne sont pas parfaitement configurés (bien que Bunny soit bien configuré)
        statuses: [0, 200],
      }),
    ],
  })
);

// ----------------------------------------------------------------------------
// GESTION DES MESSAGES DE L'UI (Ex: Téléchargement manuel)
// ----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'PREFETCH_VIDEO') {
    console.log("[Service Worker] Ordre de pré-téléchargement reçu pour:", event.data.url);
    event.waitUntil(prefetchVideo(event.data.url, event.data.videoId, event.source));
  }
});

async function prefetchVideo(masterPlaylistUrl: string, videoId: string, client: any) {
    try {
        const masterRes = await fetch(masterPlaylistUrl);
        if (!masterRes.ok) throw new Error("Impossible de récupérer la playlist principale");
        
        const masterText = await masterRes.text();
        const lines = masterText.split('\n');
        let targetPlaylist = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXT-X-STREAM-INF')) {
                if (line.includes('RESOLUTION=1280x720') || line.includes('RESOLUTION=1920x1080')) {
                     targetPlaylist = lines[i+1].trim();
                     break;
                } else if (!targetPlaylist) {
                     targetPlaylist = lines[i+1].trim();
                }
            }
        }
        
        if (!targetPlaylist) {
          targetPlaylist = 'playlist.m3u8';
        }

        const baseUrl = masterPlaylistUrl.substring(0, masterPlaylistUrl.lastIndexOf('/'));
        const mediaPlaylistUrl = targetPlaylist.startsWith('http') 
            ? targetPlaylist 
            : `${baseUrl}/${targetPlaylist}`;

        await fetch(mediaPlaylistUrl).catch(() => {});

        const mediaRes = await fetch(mediaPlaylistUrl);
        if (!mediaRes.ok) throw new Error("Impossible de lire le stream vidéo");
        
        const mediaText = await mediaRes.text();
        const urlDir = mediaPlaylistUrl.substring(0, mediaPlaylistUrl.lastIndexOf('/') + 1);

        const mediaLines = mediaText.split('\n');
        const segments: string[] = [];
        
        for (let i = 0; i < mediaLines.length; i++) {
            const line = mediaLines[i].trim();
            if (line && !line.startsWith('#')) {
                 const segmentUrl = line.startsWith('http') ? line : `${urlDir}${line}`;
                 segments.push(segmentUrl);
            }
        }

        if (segments.length === 0) throw new Error("Aucun segment vidéo trouvé");

        let completed = 0;
        const BATCH_SIZE = 4;
        
        for (let i = 0; i < segments.length; i += BATCH_SIZE) {
            const batch = segments.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (url) => {
                try {
                    await fetch(url, { mode: 'no-cors' }); 
                } catch (e) {
                    console.error("Erreur téléchargement segment:", url, e);
                }
            }));
            
            completed += batch.length;
            if (client) {
                client.postMessage({
                    type: 'PREFETCH_PROGRESS',
                    videoId: videoId,
                    progress: Math.floor((completed / segments.length) * 100)
                });
            }
        }
        
        if (client) {
            client.postMessage({
                type: 'PREFETCH_PROGRESS',
                videoId: videoId,
                progress: 100
            });
        }
    } catch (e: any) {
        if (client) {
            client.postMessage({
                type: 'PREFETCH_ERROR',
                videoId: videoId,
                error: e.message
            });
        }
    }
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
