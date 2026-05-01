const CACHE_NAME = "lab-app-v1";

const urlsToCache = [
  "/",
  "/dashboard.html",
  "/index.html",
  "/inbox.html",
  "/icons/order.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});
