'use client';

import { WithdrawalSheet } from '@/features/admin-wallet/ui/withdrawal-sheet';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

export function WalletWithdrawPage() {
  const t = useTranslations('entities.wallet');
  const [open, setOpen] = useState(true);
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Button size="lg" className="h-14 w-full" onClick={() => setOpen(true)}>
        {t('requestWithdrawal')}
      </Button>
      <WithdrawalSheet open={open} onOpenChange={setOpen} />
    </div>
  );
}
