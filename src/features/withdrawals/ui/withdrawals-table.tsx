'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useTenants } from '@/entities/tenant';
import {
  useWithdrawalBatches,
  useWithdrawals,
  type WithdrawalBatch,
  type WithdrawalRequest,
} from '@/entities/withdrawal';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  DataTable,
  DataTableEmpty,
  DataTableQueryState,
} from '@/shared/ui/data-table';
import { WithdrawalBatchCard } from './withdrawal-batch-card';
import { useWithdrawalColumns } from './withdrawal-columns';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const;

export function WithdrawalsTable() {
  const t = useTranslations('entities.withdrawals');
  const tFilter = useTranslations('withdrawals');
  const { pagination, setPagination, filters, setFilter, queryParams } =
    useTableSearchParams({
      filterParams: {
        status: { defaultValue: '' },
        tenantId: { defaultValue: '' },
      },
    });
  const status = filters.status;
  const tenantId = filters.tenantId;
  const apiParams = useMemo(
    () => ({
      page: Number(queryParams.page) || 1,
      limit: Number(queryParams.limit) || 20,
      standaloneOnly: true,
      ...(status ? { status: status as WithdrawalRequest['status'] } : {}),
      ...(tenantId ? { tenantId: Number(tenantId) } : {}),
    }),
    [queryParams.page, queryParams.limit, status, tenantId],
  );
  const batchParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      ...(status ? { status: status as WithdrawalBatch['status'] } : {}),
    }),
    [status],
  );
  const { data, isLoading, isError, error, refetch } = useWithdrawals(apiParams);
  const batchesQuery = useWithdrawalBatches(batchParams);
  const { data: tenantsData } = useTenants({ page: 1, limit: 500 });
  const tenantNames = useMemo(() => {
    const map = new Map<number, string>();
    tenantsData?.items.forEach((tenant) => map.set(tenant.id, tenant.name));
    return map;
  }, [tenantsData?.items]);
  const columns = useWithdrawalColumns(tenantNames);
  const statusTab = status || 'all';
  const batches = batchesQuery.data?.items ?? [];

  return (
    <DataTableQueryState isError={isError} error={error} refetch={refetch}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs
            value={statusTab}
            onValueChange={(value) =>
              setFilter('status', value === 'all' ? '' : value)
            }
          >
            <TabsList className="h-auto min-h-11 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="min-h-11">
                  {tFilter(
                    tab === 'all'
                      ? 'filterAll'
                      : tab === 'pending'
                        ? 'filterPending'
                        : tab === 'approved'
                          ? 'filterApproved'
                          : 'filterRejected',
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Select
            value={tenantId || 'all'}
            onValueChange={(value) =>
              setFilter('tenantId', value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="min-h-11 w-[220px]">
              <SelectValue placeholder={tFilter('filterAllTenants')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tFilter('filterAllTenants')}</SelectItem>
              {tenantsData?.items.map((tenant) => (
                <SelectItem key={tenant.id} value={String(tenant.id)}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {batches.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{tFilter('batchesHeading')}</h3>
            {batches.map((batch) => (
              <WithdrawalBatchCard
                key={batch.id}
                batch={batch}
                tenantNames={tenantNames}
              />
            ))}
          </div>
        ) : null}
        <div className="space-y-2">
          {batches.length > 0 ? (
            <h3 className="text-sm font-medium">{tFilter('standaloneHeading')}</h3>
          ) : null}
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            pageCount={data?.totalPages ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            isLoading={isLoading}
            emptyContent={<DataTableEmpty title={t('empty')} />}
          />
        </div>
      </div>
    </DataTableQueryState>
  );
}
