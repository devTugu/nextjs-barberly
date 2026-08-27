'use client';

import { useEffect, useState } from 'react';
import { BellOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';

export function CustomerPushPermissionBanner() {
  const t = useTranslations('customerShell');
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    const sync = () => setDenied(Notification.permission === 'denied');
    sync();
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  if (!denied) return null;

  return (
    <Alert variant="warning" className="mx-4 mt-3 rounded-xl">
      <BellOff className="size-4" />
      <AlertTitle>{t('pushDeniedTitle')}</AlertTitle>
      <AlertDescription>{t('pushDeniedHint')}</AlertDescription>
    </Alert>
  );
}
