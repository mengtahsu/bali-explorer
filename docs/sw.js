/* Bali Flight PWA — cache-first for offline play */
const CACHE = 'bali-flight-v3';
const ASSETS = [
  './app.html',
  './app.js',
  './app.css',
  './manifest.webmanifest',
  './icons/icon.svg',
  './app/hm128.js',
  './app/hm_p0.js',
  './app/hm_p1.js',
  './app/hm_p2.js',
  './app/hm_p3.js',
  './app/sat.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await Promise.all(ASSETS.map((u) => c.add(u).catch(() => null)));
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      try {
        const res = await fetch(e.request);
        if (res && res.ok && e.request.method === 'GET') {
          cache.put(e.request, res.clone()).catch(() => {});
        }
        return res;
      } catch (err) {
        return hit || Response.error();
      }
    })
  );
});
