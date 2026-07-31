import { Suspense } from 'react';
import { WithdrawalDetail } from '@/features/withdrawals/ui/withdrawal-detail';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlatformWithdrawalDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <RequirePermission permission={PERMISSION_CODES.WALLET_READ}>
      <Suspense>
        <WithdrawalDetail id={Number(id)} />
      </Suspense>
    </RequirePermission>
  );
}
