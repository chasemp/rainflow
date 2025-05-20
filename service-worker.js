const CACHE_NAME = 'rainflow-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon.png',
    '/splash-image.png',
    '/audio/light_rain.mp3',
    '/audio/calm_rain.mp3',
    '/audio/relax_waterfall.mp3',
    '/audio/morning_garden.mp3',
    '/audio/city_seaside_port.mp3',
    '/audio/Dawn_Chorus.mp3',
    '/audio/australia_lamington_national_park.mp3',
    '/audio/rain_song.mp3',
    '/image/light_rain_bg.png',
    '/image/calm_rain_bg.png',
    '/image/waterfall_bg.png',
    '/image/morning_garden_bg.png',
    '/image/city_seaside_port_bg.png',
    '/image/Dawn_Chorus_bg.png',
    '/image/australia_lamington_national_park_bg.png',
    '/image/rain_thunder_bg.png'
];

// Helper function to check if a URL is cacheable
function isCacheable(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Use Promise.all to handle all cache operations
                return Promise.all(
                    ASSETS_TO_CACHE.map(url => {
                        return cache.add(url).catch(error => {
                            console.warn(`Failed to cache ${url}:`, error);
                        });
                    })
                );
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip non-cacheable URLs
    if (!isCacheable(event.request.url)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                if (isCacheable(event.request.url)) {
                                    cache.put(event.request, responseToCache)
                                        .catch(error => {
                                            console.warn('Failed to cache response:', error);
                                        });
                                }
                            })
                            .catch(error => {
                                console.warn('Failed to open cache:', error);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.warn('Fetch failed:', error);
                        // Return a fallback response if available
                        return caches.match('/offline.html');
                    });
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
