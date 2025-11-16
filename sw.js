const CACHE_NAME = 'vr-explorer-cache-v1';
const urlsToCache = [
  '/',                  // index.html
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo-192.png',      // your app icons
  '/logo-512.png',
  'https://aframe.io/releases/1.4.2/aframe.min.js',
  // Cloudflare 360 video links
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N0-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N1-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N2-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N4-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N9-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N16-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N25-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N50-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N100-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N500-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/N10K-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/ACC01-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/JIC01-CF.h264.mp4',
  'https://pub-850a8ef9d4f34159a20706a415caaaf8.r2.dev/RIC01-CF.h264.mp4'
];

// Install event: cache all necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if(key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// Fetch event: respond from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if(response) return response;
      return fetch(event.request)
        .then(fetchResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // Clone and store in cache
            if(event.request.method === "GET" && fetchResponse.status === 200 && fetchResponse.type === "basic") {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        }).catch(() => {
          return new Response('Offline or not cached', {status: 503, statusText: 'Offline'});
        });
    })
  );
});
