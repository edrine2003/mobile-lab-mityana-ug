const CACHE_NAME = "lab-app-v2";

// All pages to cache for offline use
const urlsToCache = [
  "/",
  "/dashboard.html",
  "/index.html",
  "/inbox.html",
  "/login.html",
  "/tests-guide.html",
  "/faq.html",
  "/articles.html",
  "/referral.html",
  "/reviews.html",
  "/cycle.html",
  "/my-receipts.html",
  "/receipt.html",
  "/manifest.json"
];

// ── INSTALL: cache all static files ──
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache).catch(() => {}))
  );
  self.skipWaiting();
});

// ── ACTIVATE: delete old caches ──
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: smart strategy ──
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // Network-first for Firebase, APIs, fonts (always need fresh data)
  if (
    url.includes("firestore.googleapis.com") ||
    url.includes("firebase") ||
    url.includes("googleapis.com") ||
    url.includes("emailjs") ||
    url.includes("flutterwave")
  ) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else (HTML, CSS, JS, images)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        // Cache valid responses
        if (response && response.status === 200 && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML navigation requests
        if (e.request.mode === "navigate") {
          return new Response(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Offline – Mobile Lab Mityana</title>
              <style>
                body {
                  font-family: 'Nunito', Arial, sans-serif;
                  background: #f1f5f9;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  text-align: center;
                  padding: 20px;
                  margin: 0;
                }
                .icon { font-size: 72px; margin-bottom: 20px; }
                h1 { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 10px; }
                p { font-size: 14px; color: #64748b; font-weight: 600; margin-bottom: 28px; line-height: 1.6; max-width: 320px; }
                .btn {
                  display: inline-block;
                  padding: 14px 32px;
                  background: linear-gradient(135deg, #0ea5e9, #14b8a6);
                  color: #fff;
                  border-radius: 14px;
                  font-weight: 900;
                  text-decoration: none;
                  font-size: 15px;
                  margin: 6px;
                  box-shadow: 0 6px 18px rgba(14,165,233,0.3);
                }
                .btn.secondary {
                  background: #fff;
                  color: #0ea5e9;
                  border: 2px solid #0ea5e9;
                  box-shadow: none;
                }
              </style>
            </head>
            <body>
              <div class="icon">📡</div>
              <h1>You're Offline</h1>
              <p>
                No internet connection detected.<br>
                Some pages are available offline — try going back to the dashboard.
              </p>
              <a class="btn" href="/dashboard.html">🏠 Dashboard</a>
              <a class="btn secondary" href="/tests-guide.html">📖 Tests Guide</a>
              <a class="btn secondary" href="/faq.html">❓ FAQ</a>
            </body>
            </html>
          `, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
      });
    })
  );
});

// ── PUSH NOTIFICATIONS ──
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(
      data.title || "🧪 Mobile Lab Mityana",
      {
        body: data.body || "You have a new update.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
        data: { url: data.url || "/dashboard.html" }
      }
    )
  );
});

// Tap notification → open the right page
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = e.notification.data?.url || "/dashboard.html";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(target) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(target);
    })
  );
});

// ── BACKGROUND SYNC (retry failed orders when back online) ──
self.addEventListener("sync", e => {
  if (e.tag === "sync-orders") {
    e.waitUntil(retrySyncOrders());
  }
});

async function retrySyncOrders() {
  // The app stores failed orders in IndexedDB under key "pending_orders"
  // This sync event fires automatically when connection is restored
  const clients_ = await clients.matchAll({ type: "window" });
  clients_.forEach(client => {
    client.postMessage({ type: "SYNC_ORDERS" });
  });
}
