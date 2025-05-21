const CACHE_NAME = 'rainflow-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon.png',
    '/splash-image.png',
    '/header_small.png',
    
    // Audio files
    '/audio/AN_Cricket_and_Birds_at_Dusk.mp3',
    '/audio/AN_Crickets_and_Woodpecker_at_Dusk.mp3',
    '/audio/australia_lamington_national_park.mp3',
    '/audio/morning_garden.mp3',
    '/audio/AN_Morning_Bird_Chorus_at_Dawn_with_Bullfrogs.mp3',
    '/audio/AN_Night_Ambience_in_Forest_with_Stream.mp3',
    '/audio/AN_Spring_Peeper_and_American_Toad_Chorus_at_Night.mp3',
    '/audio/AN_Underwater_Ocean_Waves_in_a_Tidepool.mp3',
    '/audio/AN_Rapidly_Rising_Ocean_Tide_at_Sunset.mp3',
    '/audio/AN_Crashing_Ocean_Waves_with_Small_Pebbles.mp3',
    '/audio/AN_Crashing_Waves_in_an_Ocean_Cave.mp3',
    '/audio/AN_Powerful_Ocean_Waves_at_the_Beach.mp3',
    '/audio/AN_Light_Rain_Falling_on_Tent_with_Rolling _Thunder.mp3',
    '/audio/AN_Melting_Dripping_Icicles.mp3',
    '/audio/AN _Light_Rainfall_in_a_Swamp_with_Singing_Birds.mp3',
    '/audio/light_rain.mp3',
    '/audio/AN_Rain_Shower_with_Distant_Rolling_Thunder.mp3',
    '/audio/AN_Medium_Flow_Stream.mp3',
    '/audio/AN_Up_Close_Stream.mp3',
    '/audio/AN_Detailed_Gentle_Stream_Flow.mp3',
    '/audio/AN_Turbulent_Stream_in_a_Forest.mp3',
    '/audio/city_seaside_port.mp3',
    '/audio/AN_Gentle_Flowing_Stream.mp3',
    '/audio/AN_Babbling_Brook.mp3',
    '/audio/AN_Fast_Flowing_Stream_in_a_Forest_with_Birds.mp3',
    '/audio/AN_Nightfall_on_a_with_River_Birds_Fish_Frogs.mp3',
    '/audio/AN_Distant_Thunder_and_Water_Dripping_from_Forest_Canopy.mp3',
    '/audio/AN_Thunder_Storm_Approaching.mp3',
    '/audio/AN_Waterfall.mp3',
    '/audio/AN_Gentle_Wind_On_A_Mountaintop.mp3',
    '/audio/AN_Empty_Winter_Wind_at_Night.mp3',
    
    // Image files
    '/image/crickets_birds_bg.png',
    '/image/crickets_dusk_bg.png',
    '/image/australia_lamington_national_park_bg.png',
    '/image/morning_garden_bg.png',
    '/image/morning_river_bg.png',
    '/image/forest_night_bg.png',
    '/image/amphibian_night_bg.png',
    '/image/ocean_tidepool_bg.png',
    '/image/ocean_tide_bg.png',
    '/image/ocean_crashing_bg.png',
    '/image/ocean_cave_bg.png',
    '/image/ocean_waves_bg.png',
    '/image/tent_rain_bg.png',
    '/image/icicles_bg.png',
    '/image/marsh_rain_bg.png',
    '/image/light_rain_bg.png',
    '/image/calm_rain_bg.png',
    '/image/gentle_river_bg.png',
    '/image/easy_river_bg.png',
    '/image/medium_flow_river_bg.png',
    '/image/turbulent_stream_bg.png',
    '/image/city_seaside_port_bg.png',
    '/image/gentle_stream_bg.png',
    '/image/babbling_brook_bg.png',
    '/image/medium_stream_bg.png',
    '/image/stream_wildlife_bg.png',
    '/image/forest_thunder_bg.png',
    '/image/rain_thunder_bg.png',
    '/image/waterfall_bg.png',
    '/image/mountain_breeze_bg.png',
    '/image/winter_wind_bg.png'
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
