const CACHE_NAME = 'tiburon-v1.0';
const STATIC_CACHE = [
    '/',
    '/feed.html',
    '/assets/css/styles.css',
    '/assets/css/header.css',
    '/assets/css/top-bar.css',
    '/assets/js/app.js',
    '/assets/js/auth.js',
    '/assets/js/script-loader.js',
    '/assets/shared/header.html'
];

const DYNAMIC_CACHE = 'tiburon-dynamic-v1.0';

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Cache First Strategy for static, Network First for dynamic
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Handle feed.json with Network First (always fresh)
    if (request.url.includes('feed.json')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }
    
    // Cache First for static assets
    if (STATIC_CACHE.some(url => request.url.includes(url))) {
        event.respondWith(
            caches.match(request)
                .then(response => response || fetch(request))
        );
        return;
    }
    
    // Network First for other requests
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, responseClone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});
