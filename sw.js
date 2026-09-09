/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: SERVICE WORKER (VERSION 8)
 * Offline resilient, sub-20ms instant hydration, background streaming
 * ============================================================================
 */

const CACHE_NAME = "gold-terminal-v8";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/design-system.css",
  "./css/navigation.css",
  "./css/bento-grid.css",
  "./js/app.js",
  "./js/ml-engine.js",
  "./js/quant-risk.js",
  "./js/scheme-optimizer.js",
  "./js/share-cards.js",
  "./js/audio-chimes.js"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )
      )
    ])
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Data requests: Network-first with cache fallback
  if (url.pathname.includes("/data/")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // App shell / static assets: Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});
