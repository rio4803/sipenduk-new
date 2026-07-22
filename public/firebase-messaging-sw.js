importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBIwDP9Bx-DjKZodMYYBz3mQUaHxqUK7_k",
  authDomain: "sipenduk.firebaseapp.com",
  projectId: "sipenduk",
  storageBucket: "sipenduk.firebasestorage.app",
  messagingSenderId: "802404144559",
  appId: "1:802404144559:web:8946a888305aed148d4b5a"
});

const messaging = firebase.messaging();
function normalizePayload(payload) {
  const notif = payload?.notification || {};
  const data = payload?.data || {};

  return {
    title: notif.title || data.title || "Notifikasi Baru",
    body: notif.body || data.body || "Ada pengumuman baru",
    icon: notif.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    url: data.url || "/dashboard/notifikasi",
    tag: data.tag || "sipenduk-fcm",
    requireInteraction: data.requireInteraction === "true",
  };
}

messaging.onBackgroundMessage((payload) => {
  try {
    console.log("[SW] Background message received:", payload);

    const notif = normalizePayload(payload);

    const options = {
      body: notif.body,
      icon: notif.icon,
      badge: notif.badge,
      data: {
        url: notif.url,
      },
      tag: notif.tag,
      renotify: true,
      requireInteraction: notif.requireInteraction,
      vibrate: [100, 50, 100],
      actions: [
        { action: "open", title: "Buka Chat" },
        { action: "dismiss", title: "Tutup" },
      ],
    };

    self.registration.showNotification(notif.title, options);
  } catch (err) {
    console.error("[SW] Error handling background message:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // If user clicked "Tutup", do nothing
  if (event.action === "dismiss") return;

  const targetUrl = event.notification?.data?.url || "/dashboard/notifikasi";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener("install", () => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(self.clients.claim());
});
