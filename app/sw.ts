import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry } from 'serwist';
import { ExpirationPlugin, NetworkFirst, Serwist } from 'serwist';

const bookingApiCache = [
  {
    matcher: ({ request, url }: { request: Request; url: URL }) =>
      request.method === 'GET' &&
      !url.pathname.startsWith('/_next/') &&
      !url.pathname.endsWith('.webmanifest') &&
      (url.pathname.startsWith('/api/public/bookings') ||
        url.pathname.startsWith('/api/backend/admin/bookings')),
    handler: new NetworkFirst({
      cacheName: 'barberly-bookings',
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        }),
      ],
    }),
  },
];

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...bookingApiCache, ...defaultCache],
});

serwist.addEventListeners();

self.addEventListener('push', (event) => {
  const data = event.data?.json() as
    | { title?: string; body?: string; url?: string }
    | undefined;
  event.waitUntil(
    self.registration.showNotification(data?.title ?? 'New booking', {
      body: data?.body ?? 'A customer confirmed an appointment.',
      icon: '/icons/admin-192.svg',
      data: { url: data?.url ?? '/admin/dashboard' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url;
  if (!url) return;
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          void client.focus();
          if ('navigate' in client) {
            void (client as WindowClient).navigate(url);
          }
          return;
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
