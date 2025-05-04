const CACHE_NAME = 'rockhound-v1';
const CACHE_ASSETS = [
  './',
  './index.html',
  './main.js',
  './styles.css',
  './manifest.json',
  './icon-192.png',     // ✅ Add this if using an icon
  './icon-512.png',     // ✅ Add this too
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js'
];

// Install event: cache all essential assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
});

// Activate event: cleanup old caches (optional, but good practice)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});

// Fetch event: serve cached content if available
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
