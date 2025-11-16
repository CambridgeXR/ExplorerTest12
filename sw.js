const CACHE_NAME = 'vr-explorer-cache-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/ExplorerTest12/index.html',
  '/ExplorerTest12/manifest.json',
  '/ExplorerTest12/icons/icon-192.png',
  '/ExplorerTest12/icons/icon-512.png'
];

// Cloudflare-hosted 360 video files
const CLOUD_VIDEO_FILES = [
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N0-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N1-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N2-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N4-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N9-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N16-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N25-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N50-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N100-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N500-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N10K-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/ACC01-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/JIC01-CF.h264.mp4",
  "https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/RIC01-CF.h264.mp4"
];

// Install: cache app shell + videos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([...ASSETS_TO_CACHE, ...CLOUD_VIDEO_FILES]))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME)
                      .map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch: serve cached content if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => new Response('Offline', {status: 503, statusText: 'Offline'}));
    })
  );
});
