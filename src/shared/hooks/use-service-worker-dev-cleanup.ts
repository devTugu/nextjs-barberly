'use client';

import { useEffect } from 'react';

/**
 * Dev-only: unregister stale service workers and clear caches.
 * A leftover production SW breaks Turbopack chunks (RSC decode errors).
 */
export function useServiceWorkerDevCleanup(): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!('serviceWorker' in navigator)) return;

    void (async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    })();
  }, []);
}
