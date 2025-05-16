const CACHE_NAME = 'mp3-player-cache-v1';
const urlsToCache = [
  'index.html',
  'style.css',
  'script.js',
  'audio/light_rain.mp3',
  'audio/calm_rain.mp3',
  'audio/relax_waterfall.mp3',
  'audio/australia_lamington_national_park.mp3',
  'audio/rain_song.mp3',
  'image/calm_rain_bg.png',
  'image/light_rain_bg.png',
  'image/waterfall_bg.png',
  'icon.png',
  'splash-image.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
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
