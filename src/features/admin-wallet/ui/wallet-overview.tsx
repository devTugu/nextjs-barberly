'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  useBrandBranchBalances,
  useWalletBalance,
  useWalletTransactions,
  useWalletWithdrawals,
  type WalletWithdrawalRequest,
} from '@/entities/wallet';
import { useWalletTransactionColumns } from '@/entities/wallet/ui/wallet-columns';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import {
  DataTable,
  DataTableEmpty,
  DataTableQueryState,
} from '@/widgets/data-table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { WithdrawalSheet } from './withdrawal-sheet';
import { BrandBatchWithdrawSheet } from './brand-batch-withdraw-sheet';

function useWithdrawalColumns() {
  const t = useTranslations('entities.wallet');
  const tStatus = useTranslations('status');

  return useMemo<ColumnDef<WalletWithdrawalRequest, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('withdrawalDate'),
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString(),
      },
      {
        accessorKey: 'amount',
        header: t('withdrawalAmount'),
        cell: ({ row }) => `${row.original.amount.toLocaleString()}₮`,
      },
      {
        accessorKey: 'status',
        header: t('withdrawalStatus'),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'approved'
                ? 'default'
                : row.original.status === 'rejected'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {tStatus(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: 'reference',
        header: t('referenceLabel'),
        cell: ({ row }) => row.original.reference ?? '—',
      },
    ],
    [t, tStatus],
  );
}

export function WalletOverview() {
  const t = useTranslations('entities.wallet');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = useAuthPermissions();
  const txColumns = useWalletTransactionColumns();
  const withdrawalColumns = useWithdrawalColumns();
  const { pagination, setPagination, queryParams } = useTableSearchParams();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [tab, setTab] = useState('transactions');

  useEffect(() => {
    if (searchParams.get('withdraw') === '1') {
      setWithdrawOpen(true);
      router.replace(ROUTES.ADMIN_WALLET);
    }
  }, [searchParams, router]);

  const balanceQuery = useWalletBalance(tenant);
  const brandBalancesQuery = useBrandBranchBalances(tenant);
  const txQuery = useWalletTransactions(tenant, {
    page: Number(queryParams.page) || 1,
    limit: Number(queryParams.limit) || 20,
  });
  const withdrawalsQuery = useWalletWithdrawals(tenant, {
    page: Number(queryParams.page) || 1,
    limit: Number(queryParams.limit) || 20,
  });

  const canWithdraw = can(PERMISSION_CODES.WALLET_UPDATE);
  const showBatchWithdraw =
    (brandBalancesQuery.data?.branches.length ?? 0) > 1;

  return (
    <div className="space-y-6">
      <Card className="max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            {t('balanceTitle')}
          </CardTitle>
          {canWithdraw ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button size="sm" onClick={() => setWithdrawOpen(true)}>
                {t('requestWithdrawal')}
              </Button>
              {showBatchWithdraw ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBatchOpen(true)}
                >
                  {t('batchWithdrawCta')}
                </Button>
              ) : null}
            </div>
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transactions">{t('transactionsTitle')}</TabsTrigger>
          <TabsTrigger value="withdrawals">{t('withdrawalsTitle')}</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions" className="space-y-4">
          <DataTableQueryState
            isError={txQuery.isError}
            error={txQuery.error}
            refetch={txQuery.refetch}
          >
            <DataTable
              columns={txColumns}
              data={txQuery.data?.items ?? []}
              pageCount={txQuery.data?.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={txQuery.isLoading}
              emptyContent={<DataTableEmpty title={t('emptyTransactions')} />}
            />
          </DataTableQueryState>
        </TabsContent>
        <TabsContent value="withdrawals" className="space-y-4">
          <DataTableQueryState
            isError={withdrawalsQuery.isError}
            error={withdrawalsQuery.error}
            refetch={withdrawalsQuery.refetch}
          >
            <DataTable
              columns={withdrawalColumns}
              data={withdrawalsQuery.data?.items ?? []}
              pageCount={withdrawalsQuery.data?.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
              isLoading={withdrawalsQuery.isLoading}
              emptyContent={<DataTableEmpty title={t('emptyWithdrawals')} />}
            />
          </DataTableQueryState>
        </TabsContent>
      </Tabs>

      <WithdrawalSheet open={withdrawOpen} onOpenChange={setWithdrawOpen} />
      <BrandBatchWithdrawSheet open={batchOpen} onOpenChange={setBatchOpen} />
    </div>
  );
}
