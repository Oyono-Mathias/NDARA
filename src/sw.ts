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
    // Cette partie sera détaillée en Phase 3 (téléchargement délibéré d'un cours complet)
    console.log("[Service Worker] Ordre de pré-téléchargement reçu pour:", event.data.url);
  }
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
