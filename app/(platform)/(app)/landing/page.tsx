import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { RequirePermission } from '@/features/auth';
import { PlatformLandingEditor } from '@/features/platform-landing/ui/platform-landing-editor';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { platformSiteUrl } from '@/shared/lib/tenant-url';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function PlatformLandingSettingsPage() {
  const t = await getTranslations('platformLanding');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_UPDATE}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <AdminPageHeader title={t('title')} description={t('description')} />
          <Button asChild variant="outline">
            <Link href={platformSiteUrl(ROUTES.HOME)} target="_blank" rel="noreferrer">
              {t('viewLive')}
            </Link>
          </Button>
        </div>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PlatformLandingEditor />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
