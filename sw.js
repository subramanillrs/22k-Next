/**
 * ============================================================================
 * CHENNAI 22K GOLD NEXT: SERVICE WORKER (VERSION 31)
 * Offline resilient app shell and network-first market data
 * ============================================================================
 */

const CACHE_NAME = "gold-terminal-v31";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/design-system.css?v=31",
  "./css/navigation.css?v=31",
  "./css/bento-grid.css?v=31",
  "./css/upgrade.css?v=31",
  "./js/app.js?v=31",
  "./js/live-price-config.js?v=31",
  "./js/local-tools.js?v=31",
  "./js/ml-engine.js?v=31",
  "./js/quant-risk.js?v=31",
  "./js/scheme-optimizer.js?v=31",
  "./js/share-cards.js?v=31",
  "./js/audio-chimes.js?v=31"
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
          if (!response || response.status !== 200) return response;
          return caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, response.clone()))
            .then(() => response, () => response);
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }

  // Data requests: Network-first with cache fallback
  if (url.pathname.includes("/data/") || url.pathname.endsWith("/live")) {
    // Pollers add a fresh query string on every check. Keep one current entry
    // per data path instead of accumulating a cache key every minute.
    const cacheKey = new Request(url.origin + url.pathname, { method: "GET" });
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          return caches.open(CACHE_NAME)
            .then(cache => cache.put(cacheKey, response.clone()))
            .then(() => response, () => response);
        })
        .catch(() => caches.match(cacheKey))
    );
    return;
  }

  // App shell / static assets: stale-while-revalidate. Keep query strings in
  // cache keys so a versioned URL never receives an older build.
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        return caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, response.clone()))
          .then(() => response, () => response);
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});
