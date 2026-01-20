// Simple service worker for PWA push notifications
const CACHE_NAME = 'sipenduk-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Pengumuman Baru',
    body: 'Ada pengumuman baru dari desa',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: '/dashboard/notifikasi'
    }
  };

  // Try to parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  if (self.Notification.permission === 'granted') {
    const promiseChain = self.registration.showNotification(
      notificationData.title,
      {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        data: notificationData.data,
        vibrate: [200, 100, 200],
        tag: 'sipenduk-notification',
        requireInteraction: false
      }
    );

    event.waitUntil(promiseChain);
  } else {
    console.log('Notification permission not granted');
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received');
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard/notifikasi';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if no existing window found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
});
