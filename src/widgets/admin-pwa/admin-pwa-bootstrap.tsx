'use client';

import { useEffect } from 'react';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output.buffer;
}

export function AdminPwaBootstrap() {
  const tenant = useTenantSubdomain();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.register('/sw.js', { scope: '/' });

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (
      !vapidKey ||
      !('Notification' in window) ||
      !('PushManager' in window)
    ) {
      return;
    }

    const setupPush = async () => {
      if (Notification.permission === 'denied') return;

      const permission =
        Notification.permission === 'granted'
          ? 'granted'
          : await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        }));

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      await api.post(
        API_ENDPOINTS.PUSH_SUBSCRIPTIONS.SUBSCRIBE,
        {
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
        { params: tenantQueryParams(tenant) },
      );
    };

    void setupPush().catch(() => undefined);
  }, [tenant]);

  return null;
}
