import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

// Handle push notifications
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('push', ((event: any) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, icon, badge, url } = data;

    event.waitUntil(
      self.registration.showNotification(title || 'New Chapter', {
        body: body || 'New chapter available!',
        icon: icon || '/icons/icon-192x192.png',
        badge: badge || '/icons/icon-72x72.png',
        data: { url: url || '/' },
      } as NotificationOptions)
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('New Chapter', {
        body: event.data.text(),
      })
    );
  }
}) as EventListener);

// Handle notification click
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('notificationclick', ((event: any) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList: readonly WindowClient[]) => {
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
}) as EventListener);

serwist.addEventListeners();
