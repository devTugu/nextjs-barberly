'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTenant } from '@/entities/tenant';
import { ROUTES } from '@/shared/config/routes';
import { tenantAdminUrl } from '@/shared/lib/tenant-url';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { Skeleton } from '@/shared/ui/skeleton';

export function TenantDetailPage({ id }: { id: number }) {
  const t = useTranslations('entities.tenants');
  const tSettings = useTranslations('adminSettings');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');
  const tStatus = useTranslations('status');
  const { data, isLoading } = useTenant(id);
  if (isLoading) {
    return <Skeleton className="mx-auto h-64 max-w-2xl" />;
  }
  if (!data) {
    return <p className="text-muted-foreground text-sm">{tCommon('notFound')}</p>;
  }
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{data.name}</CardTitle>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.platformTenantEdit(data.id)}>
              {t('editTenant')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`${ROUTES.PLATFORM_AUDIT}?tenantId=${data.id}`}>
              {t('viewAuditLogs')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={tenantAdminUrl(data.subdomain, ROUTES.ADMIN_DASHBOARD)}>
              <ExternalLink className="mr-1 size-3.5" />
              {t('openShop')}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">{tTable('slug')}</p>
            <p className="font-medium">{data.subdomain}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{tTable('timezone')}</p>
            <p className="font-medium">{data.timezone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{tTable('status')}</p>
            <p className="font-medium">
              {data.isActive ? tStatus('active') : tStatus('inactive')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('phone')}</p>
            <p className="font-medium">{data.settings.phone ?? '—'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">{t('address')}</p>
            <p className="font-medium">{data.settings.address ?? '—'}</p>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="mb-3 font-medium">{tSettings('brandingTitle')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">{tSettings('logoUrl')}</p>
              <p className="font-medium break-all">
                {data.settings.logoUrl ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{tSettings('bannerUrl')}</p>
              <p className="font-medium break-all">
                {data.settings.bannerUrl ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{tSettings('brandColor')}</p>
              <div className="mt-1 flex items-center gap-2">
                {data.settings.brandColor ? (
                  <>
                    <span
                      className="size-5 rounded border"
                      style={{ backgroundColor: data.settings.brandColor }}
                    />
                    <span className="font-mono font-medium">
                      {data.settings.brandColor}
                    </span>
                  </>
                ) : (
                  <span className="font-medium">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="mb-3 font-medium">{tSettings('policyTitle')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">{t('slotLockMinutes')}</p>
              <p className="font-medium">{data.policies.slotLockMinutes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('commissionPercent')}</p>
              <p className="font-medium">{data.policies.commissionPercent}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {tSettings('cancelHoursBefore')}
              </p>
              <p className="font-medium">{data.policies.cancelHoursBefore}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {tSettings('rescheduleHoursBefore')}
              </p>
              <p className="font-medium">
                {data.policies.rescheduleHoursBefore}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
