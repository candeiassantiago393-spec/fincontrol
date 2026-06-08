const CACHE = 'fincontrol-preview-v4';
const ASSETS = ['./mobile-preview.html', './manifest.webmanifest', './sample-data.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match('./mobile-preview.html'))),
  );
});
