import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { WalletOverview } from '@/features/admin-wallet';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { Skeleton } from '@/shared/ui/skeleton';

export default async function ShopWalletPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('entities.wallet');

  return (
    <RequirePermission permission={PERMISSION_CODES.WALLET_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={tNav('adminWallet')}
          description={t('pageDescription')}
        />
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-32 w-full max-w-md" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <WalletOverview />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
