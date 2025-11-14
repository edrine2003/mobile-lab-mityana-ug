// -----------------------------------------------------------------------------
// 1. INSTALL EVENT – CACHE IMPORTANT FILES
// -----------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("mobile-lab-cache-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json",
        "./icon-192.png",
        "./icon-512.png"
      ]);
    })
  );
});

// -----------------------------------------------------------------------------
// 2. FETCH EVENT – SERVE FROM CACHE FIRST, THEN FALLBACK TO NETWORK
// -----------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// -----------------------------------------------------------------------------
// 3. PUSH EVENT – SHOW NOTIFICATIONS (REQUIRED FOR FCM WEB PUSH)
// -----------------------------------------------------------------------------
self.addEventListener("push", (event) => {
  let data = { title: "New Notification", body: "You have a message!" };

  // If the server sent JSON
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: "icon-192.png",
    badge: "icon-192.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "./" // link to open when clicked
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// -----------------------------------------------------------------------------
// 4. CLICK EVENT – OPEN THE PAGE WHEN USER TAPS THE NOTIFICATION
// -----------------------------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickedURL = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If tab is already open, focus it
        for (let client of clientList) {
          if (client.url.includes(clickedURL) && "focus" in client) {
            return client.focus();
          }
        }
        // If not open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(clickedURL);
        }
      })
  );
});
