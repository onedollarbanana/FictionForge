import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// Manual type declarations for service worker events
// (webworker lib can't be in tsconfig alongside dom)
interface PushEventData {
  json(): unknown;
  text(): string;
}

interface PushEventLike extends ExtendableEvent {
  data: PushEventData | null;
}

interface NotificationEventLike extends ExtendableEvent {
  action: string;
  notification: Notification & { data?: Record<string, unknown> };
}

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
self.addEventListener('push', ((event: PushEventLike) => {
  if (!event.data) return;

  try {
    const data = event.data.json() as Record<string, string>;
    const { title, body, icon, badge, url } = data;

    const options: Record<string, unknown> = {
      body: body || 'New chapter available!',
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-72x72.png',
      data: { url: url || '/' },
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Read Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(
        title || 'New Chapter',
        options as NotificationOptions
      )
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('New Chapter', {
        body: event.data!.text(),
      })
    );
  }
}) as EventListener);

// Handle notification click
self.addEventListener('notificationclick', ((event: NotificationEventLike) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = (event.notification.data?.url as string) || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
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
