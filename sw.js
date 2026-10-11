/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: SERVICE WORKER (VERSION 8)
 * Offline resilient, sub-20ms instant hydration, background streaming
 * ============================================================================
 */

const CACHE_NAME = "gold-terminal-v12";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/design-system.css?v=12",
  "./css/navigation.css?v=12",
  "./css/bento-grid.css?v=12",
  "./js/app.js?v=12",
  "./js/ml-engine.js?v=12",
  "./js/quant-risk.js?v=12",
  "./js/scheme-optimizer.js?v=12",
  "./js/share-cards.js?v=12",
  "./js/audio-chimes.js?v=12"
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

  // Navigation / HTML requests: Network-first with cache fallback
  if (event.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }

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

  // App shell / static assets: stale-while-revalidate. Keep query strings in
  // cache keys so a versioned URL never receives an older build.
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
