/// <reference lib="webworker" />

const CACHE_NAME = 'ndara-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => (self as any).skipWaiting())
  );
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => (self as any).clients.claim())
  );
});

self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  // SECURE ZERO TRUST: Do not cache API calls, Firebase endpoints, or financial data
  if (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('firebase') || 
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis') ||
    url.pathname.includes('wallet') ||
    url.pathname.includes('transactions')
  ) {
    return; // Fallback to network only
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
