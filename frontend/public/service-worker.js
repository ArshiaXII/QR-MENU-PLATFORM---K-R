// Basic service worker for PWA installability

// Define a cache name
const CACHE_NAME = 'qr-menu-cache-v1';
// Define URLs to cache initially (optional, can be empty for basic installability)
const urlsToCache = [
  '/', // Cache the root/entry point
  '/index.html', // Cache the main HTML file
  '/manifest.json' // Cache the manifest
  // Add other essential assets like logo192.png, logo512.png if needed
];

// Install event: Cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event triggered');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // AddAll can fail if any resource fails to fetch
        // Consider using cache.add() individually with error handling for robustness
        return cache.addAll(urlsToCache).catch(error => {
            console.error('[Service Worker] Failed to cache initial assets:', error);
        });
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting after install.');
        return self.skipWaiting(); // Activate the new service worker immediately
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event triggered');
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[Service Worker] Claiming clients.');
        return self.clients.claim(); // Take control of uncontrolled clients
    })
  );
});

// Fetch event: Serve from cache if available, otherwise fetch from network (Cache-first strategy)
// More sophisticated strategies (Network-first, Stale-while-revalidate) can be implemented later.
self.addEventListener('fetch', (event) => {
    // console.log('[Service Worker] Fetch intercepted for:', event.request.url);
    // Skip API requests and non-GET requests
    if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
        // console.log('[Service Worker] Skipping non-local or non-GET request:', event.request.url);
        return; 
    }

    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // Cache hit - return response
            if (response) {
            // console.log('[Service Worker] Serving from cache:', event.request.url);
            return response;
            }

            // Not in cache - fetch from network
            // console.log('[Service Worker] Fetching from network:', event.request.url);
            return fetch(event.request).then(
            (networkResponse) => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
                }

                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME)
                .then((cache) => {
                    // console.log('[Service Worker] Caching new resource:', event.request.url);
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }
            ).catch(error => {
                console.error('[Service Worker] Fetch failed; returning offline page instead.', error);
                // Optional: Return an offline fallback page if fetch fails
                // return caches.match('/offline.html'); 
            });
        })
    );
});
