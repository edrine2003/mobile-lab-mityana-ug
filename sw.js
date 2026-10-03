const CACHE_NAME = "lab-app-v5";

const urlsToCache = [
  "/",
  "/dashboard.html",
  "/index.html",
  "/inbox.html",
  "/login.html",
  "/register.html",
  "/chat.html",
  "/appointments.html",
  "/cycle.html",
  "/wallet.html",
  "/profile.html",
  "/terms.html",
  "/faq.html",
  "/articles.html",
  "/referral.html",
  "/reviews.html",
  "/doctor-referral.html",
  "/tests-guide.html",
  "/my-receipts.html",
  "/receipt.html",
  "/offline.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// ── INSTALL ──
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(urlsToCache.map(url =>
        cache.add(url).catch(err => console.warn("Cache miss:", url, err))
      ))
    )
  );
});

// ── ACTIVATE ──
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener("fetch", e => {
  const url = e.request.url;

  if (e.request.method !== "GET") return;

  // Network-first for Firebase, APIs, CDN, fonts
  if (
    url.includes("firestore.googleapis.com") ||
    url.includes("firebase") ||
    url.includes("googleapis.com") ||
    url.includes("emailjs") ||
    url.includes("cdn.jsdelivr.net") ||
    url.includes("cdnjs.cloudflare.com") ||
    url.includes("fonts.g")
  ) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Cache-first for app files
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — serve dedicated offline page for navigation requests
        if (e.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});

// ── PUSH NOTIFICATIONS ──
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || "🧪 Mobile Lab Mityana", {
      body: data.body || "You have a new update.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      data: { url: data.url || "/dashboard.html" }
    })
  );
});

// ── NOTIFICATION CLICK ──
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = e.notification.data?.url || "/dashboard.html";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(target) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
