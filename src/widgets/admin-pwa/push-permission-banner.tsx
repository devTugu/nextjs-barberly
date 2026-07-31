'use client';

import { useEffect, useState } from 'react';
import { BellOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';

export function PushPermissionBanner() {
  const t = useTranslations('entities.push');
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;

    const sync = () => {
      setDenied(Notification.permission === 'denied');
    };

    sync();
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  if (!denied) return null;

  return (
    <Alert variant="warning" className="rounded-none border-x-0 border-t-0">
      <BellOff className="size-4" />
      <AlertTitle>{t('permissionDeniedTitle')}</AlertTitle>
      <AlertDescription>{t('permissionDeniedHint')}</AlertDescription>
    </Alert>
  );
}
