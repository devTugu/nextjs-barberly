'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export function AdminSettingsHub() {
  const t = useTranslations('adminSettings');

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('hubTitle')}</CardTitle>
          <CardDescription>{t('hubDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_SETTINGS_BRANDING}>{t('branding')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_SETTINGS_LANDING}>{t('landing')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_SETTINGS_POLICY}>{t('policies')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_SCHEDULE}>{t('schedule')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_SCHEDULE_EXCEPTIONS}>{t('exceptions')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_SETTINGS_LOYALTY}>{t('loyalty')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={ROUTES.ADMIN_RENT_INVOICES}>{t('rentInvoices')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
