/* Bali Flight PWA — arcade self-contained */
const CACHE = 'bali-flight-v10-arcade';
const ASSETS = [
  './app.html',
  './app.js',
  './app.css',
  './manifest.webmanifest',
  './icons/icon.svg',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    await Promise.all(ASSETS.map((u) => c.add(u).catch(() => null)));
    self.skipWaiting();
  }));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    try {
      const res = await fetch(e.request);
      if (res && res.ok && e.request.method === 'GET') {
        const url = e.request.url;
        if (url.includes('app.js') || url.includes('app.css') || url.includes('app.html') || url.includes('sw.js')) {
          cache.put(e.request, res.clone()).catch(() => {});
        }
      }
      return res;
    } catch (err) {
      const hit = await cache.match(e.request);
      return hit || Response.error();
    }
  }));
});
