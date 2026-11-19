/* Shohibul Quran System (SQS) - Web Push Service Worker */

const SQS_APP_URL = 'https://shohibulquran.id/';
const SQS_NOTIFICATION_TAG = 'sqs-push';

self.addEventListener('push', (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (err) {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || 'Shohibul Quran';

  const options = {
    body: payload.body || 'Ada informasi terbaru dari Shohibul Quran.',
    tag: payload.tag || SQS_NOTIFICATION_TAG,
    renotify: Boolean(payload.renotify),
    data: {
      url: payload.url || SQS_APP_URL,
      type: payload.type || 'general',
      scheduleId: payload.scheduleId || null
    }
  };

  if (payload.icon) options.icon = payload.icon;
  if (payload.badge) options.badge = payload.badge;
  if (payload.image) options.image = payload.image;
  if (Array.isArray(payload.actions)) {
    options.actions = payload.actions;
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || SQS_APP_URL;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {

      for (const client of windowClients) {
        if ('focus' in client) {
          const clientUrl = new URL(client.url);
          const target = new URL(targetUrl);

          if (clientUrl.origin === target.origin) {
            return client.focus().then((focusedClient) => {
              if (focusedClient && 'navigate' in focusedClient) {
                return focusedClient.navigate(targetUrl);
              }
              return focusedClient;
            });
          }
        }
      }

      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', () => {
  // Reserved for future notification analytics.
});
