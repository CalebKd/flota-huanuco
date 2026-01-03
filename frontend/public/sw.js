const CACHE_NAME = 'flota-muni-v2';
const urlsToCache = [
    '/',
    '/index.html'
];

// Install event - cache essential files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Network first, then cache for API calls; Cache first for static assets
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Always go to network for API calls (to ensure fresh data)
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(request)
                .catch(() => new Response(JSON.stringify({ error: 'Sin conexión' }), {
                    headers: { 'Content-Type': 'application/json' }
                }))
        );
        return;
    }

    // For navigation and static assets: network first, fallback to cache
    event.respondWith(
        fetch(request)
            .then(response => {
                // Clone and cache successful responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});
