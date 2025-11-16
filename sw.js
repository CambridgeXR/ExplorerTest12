const CACHE_NAME = 'vr-explorer-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/ExplorerTest12/index.html',
  '/ExplorerTest12/manifest.json',
  '/ExplorerTest12/icons/icon-192.png',
  '/ExplorerTest12/icons/icon-512.png',
  // Add your CSS or JS files here if separate
];

// Install event: cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event: respond with cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          // Optionally cache new requests
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Optionally return a fallback offline page
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
