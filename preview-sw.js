const CACHE = 'fincontrol-preview-v8';
const DATA_CACHE = 'fincontrol-data-v1';
const BACKUP_CACHE_URL = '/__fincontrol_backup__';
const ASSETS = ['./mobile-preview.html', './manifest.webmanifest', './sample-data.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('message', (e) => {
  if (e.data?.type !== 'SAVE_BACKUP' || !e.data.payload) return;
  e.waitUntil(
    caches.open(DATA_CACHE).then((cache) =>
      cache.put(
        BACKUP_CACHE_URL,
        new Response(JSON.stringify(e.data.payload), { headers: { 'Content-Type': 'application/json' } }),
      ),
    ),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match('./mobile-preview.html'))),
  );
});
