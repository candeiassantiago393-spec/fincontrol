const CACHE = 'fincontrol-preview-v35';
const DATA_CACHE = 'fincontrol-data-v1';
const BACKUP_CACHE_URL = '/__fincontrol_backup__';
/* Não pré-cachear HTML — evita ficar preso em versões antigas (ex. 1.2.7) */
const ASSETS = ['./manifest.webmanifest', './sample-data.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k !== DATA_CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
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

function isNetworkFirst(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  return request.mode === 'navigate'
    || url.pathname.endsWith('.html')
    || url.pathname.endsWith('preview-sw.js')
    || url.search.includes('refresh=');
}

self.addEventListener('fetch', (e) => {
  if (!isNetworkFirst(e.request)) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match('./index.html'))),
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html'))),
  );
});
