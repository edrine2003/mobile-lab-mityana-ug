const CACHE_NAME = "lab-app-v2";

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
  "/manifest.json"
];

// ── INSTALL ──
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(() => {}))
  );
  self.skipWaiting();
});

// ── ACTIVATE ──
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH ──
self.addEventListener("fetch", e => {
  const url = e.request.url;

  // Network-first for Firebase, APIs, fonts
  if(url.includes("firestore.googleapis.com") ||
     url.includes("firebase") ||
     url.includes("googleapis.com") ||
     url.includes("emailjs") ||
     url.includes("fonts.g")){
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        if(response && response.status === 200 && response.type !== "opaque"){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if(e.request.mode === "navigate"){
          return new Response(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Offline – Mobile Lab Mityana</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap" rel="stylesheet">
<style>
body{font-family:'Nunito',Arial,sans-serif;background:#f1f5f9;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;margin:0;}
.icon{font-size:72px;margin-bottom:20px;}
h1{font-size:24px;font-weight:900;color:#0f172a;margin-bottom:10px;}
p{font-size:14px;color:#64748b;font-weight:600;margin-bottom:28px;line-height:1.6;max-width:320px;}
.btn{display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0ea5e9,#14b8a6);color:#fff;border-radius:14px;font-weight:900;text-decoration:none;font-size:15px;margin:6px;box-shadow:0 6px 18px rgba(14,165,233,0.3);}
.btn.sec{background:#fff;color:#0ea5e9;border:2px solid #0ea5e9;box-shadow:none;}
</style></head>
<body>
<div class="icon">📡</div>
<h1>You're Offline</h1>
<p>No internet connection detected.<br>Some pages are available offline — try going back to the dashboard.</p>
<a class="btn" href="/dashboard.html">🏠 Dashboard</a>
<a class="btn sec" href="/login.html">🔐 Login</a>
</body></html>`, {
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
    self.registration.showNotification(data.title || "🧪 Mobile Lab Mityana", {
      body: data.body || "You have a new update.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      data: { url: data.url || "/dashboard.html" }
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = e.notification.data?.url || "/dashboard.html";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for(const c of list){
        if(c.url.includes(target) && "focus" in c) return c.focus();
      }
      return clients.openWindow(target);
    })
  );
});

// ── BACKGROUND SYNC ──
self.addEventListener("sync", e => {
  if(e.tag === "sync-orders"){
    e.waitUntil(
      clients.matchAll({ type: "window" }).then(list => {
        list.forEach(c => c.postMessage({ type: "SYNC_ORDERS" }));
      })
    );
  }
});
