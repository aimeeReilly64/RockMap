self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('rockhound-v1').then((cache) => {
        return cache.addAll([
          './',
          './index.html',
          './main.js',
          './styles.css',
          './manifest.json',
          'https://unpkg.com/leaflet/dist/leaflet.css',
          'https://unpkg.com/leaflet/dist/leaflet.js'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((res) => res || fetch(e.request))
    );
  });
  