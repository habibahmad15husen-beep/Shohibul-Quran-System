
/* Shohibul Quran System - Web Push Service Worker */

self.addEventListener('push', function(event) {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = {
      body: event.data ? event.data.text() : ''
    };
  }

  const title = data.title || 'Shohibul Quran';

  const options = {
    body: data.message || data.body ||
      'Ada informasi terbaru dari Shohibul Quran.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/'
    },
    tag: data.tag || 'sqs-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const target = new URL(
    (event.notification.data && event.notification.data.url) || '/',
    self.location.origin
  ).href;

  event.waitUntil((async function() {
    const clientsList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of clientsList) {
      if (
        client.url.startsWith(self.location.origin) &&
        'focus' in client
      ) {
        await client.focus();

        if ('navigate' in client && client.url !== target) {
          await client.navigate(target);
        }

        return;
      }
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(target);
    }
  })());
});
