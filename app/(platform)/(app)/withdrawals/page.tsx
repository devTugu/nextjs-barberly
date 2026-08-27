import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { WithdrawalsTable } from '@/features/withdrawals';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';

export default async function PlatformWithdrawalsPage() {
  const tNav = await getTranslations('nav');

  return (
    <RequirePermission permission={PERMISSION_CODES.WALLET_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={tNav('withdrawals')} />
        <Suspense>
          <WithdrawalsTable />
        </Suspense>
      </div>
    </RequirePermission>
  );
}
