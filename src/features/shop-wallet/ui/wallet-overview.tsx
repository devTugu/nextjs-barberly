'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  useWalletBalance,
  useWalletTransactions,
} from '@/entities/wallet';
import { useWalletTransactionColumns } from '@/entities/wallet/ui/wallet-columns';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { useShopTenant } from '@/shared/hooks/use-shop-tenant';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import {
  DataTable,
  DataTableEmpty,
  DataTableQueryState,
} from '@/widgets/data-table';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { WithdrawalSheet } from './withdrawal-sheet';

export function WalletOverview() {
  const t = useTranslations('entities.wallet');
  const tenant = useShopTenant();
  const { can } = useAuthPermissions();
  const txColumns = useWalletTransactionColumns();
  const { pagination, setPagination, queryParams } = useTableSearchParams();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const balanceQuery = useWalletBalance(tenant);
  const txQuery = useWalletTransactions(tenant, {
    page: Number(queryParams.page) || 1,
    limit: Number(queryParams.limit) || 20,
  });

  const columns = useMemo(() => txColumns, [txColumns]);
  const canWithdraw = can(PERMISSION_CODES.WALLET_UPDATE);

  return (
    <div className="space-y-6">
      <Card className="max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            {t('balanceTitle')}
          </CardTitle>
          {canWithdraw ? (
            <Button size="sm" onClick={() => setWithdrawOpen(true)}>
              {t('requestWithdrawal')}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {balanceQuery.isLoading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <p className="text-3xl font-semibold tracking-tight">
              {balanceQuery.data?.balance.toLocaleString() ?? '—'}{' '}
              <span className="text-muted-foreground text-lg font-normal">
                {balanceQuery.data?.currency ?? 'MNT'}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-sm font-medium">{t('transactionsTitle')}</h2>
        <DataTableQueryState
          isError={txQuery.isError}
          error={txQuery.error}
          refetch={txQuery.refetch}
        >
          <DataTable
            columns={columns}
            data={txQuery.data?.items ?? []}
            pageCount={txQuery.data?.totalPages ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            isLoading={txQuery.isLoading}
            emptyContent={<DataTableEmpty title={t('emptyTransactions')} />}
          />
        </DataTableQueryState>
      </div>

      <WithdrawalSheet open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </div>
  );
}
