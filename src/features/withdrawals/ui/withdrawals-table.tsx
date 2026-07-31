'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useTenants } from '@/entities/tenant';
import {
  useApproveWithdrawalBatch,
  useRejectWithdrawalBatch,
  useWithdrawalBatches,
  useWithdrawals,
  type WithdrawalBatch,
  type WithdrawalRequest,
} from '@/entities/withdrawal/api/queries';
import { getErrorMessage } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';
import {
  DataTable,
  DataTableEmpty,
  DataTableQueryState,
} from '@/widgets/data-table';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const;

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' {
  if (status === 'approved') return 'default';
  if (status === 'rejected') return 'destructive';
  return 'secondary';
}

function useWithdrawalColumns(tenantNames: Map<number, string>) {
  const t = useTranslations('entities.withdrawals');
  const tStatus = useTranslations('status');

  return useMemo<ColumnDef<WithdrawalRequest, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('id'),
        cell: ({ row }) => (
          <Button variant="link" className="h-auto min-h-11 p-0" asChild>
            <Link href={ROUTES.platformWithdrawal(row.original.id)}>
              #{row.original.id}
            </Link>
          </Button>
        ),
      },
      {
        accessorKey: 'tenantId',
        header: t('tenant'),
        cell: ({ row }) =>
          tenantNames.get(row.original.tenantId) ??
          `#${row.original.tenantId}`,
      },
      {
        accessorKey: 'amount',
        header: t('amount'),
        cell: ({ row }) => `${row.original.amount.toLocaleString()}₮`,
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {tStatus(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: 'reference',
        header: t('reference'),
        cell: ({ row }) => row.original.reference ?? '—',
      },
      {
        accessorKey: 'reviewedAt',
        header: t('reviewedAt'),
        cell: ({ row }) =>
          row.original.reviewedAt
            ? new Date(row.original.reviewedAt).toLocaleString()
            : '—',
      },
      {
        accessorKey: 'reviewedByEmail',
        header: t('reviewedBy'),
        cell: ({ row }) => row.original.reviewedByEmail ?? '—',
      },
      {
        accessorKey: 'createdAt',
        header: t('createdAt'),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
    ],
    [t, tStatus, tenantNames],
  );
}

function BatchCard({
  batch,
  tenantNames,
}: {
  batch: WithdrawalBatch;
  tenantNames: Map<number, string>;
}) {
  const t = useTranslations('withdrawals');
  const tStatus = useTranslations('status');
  const tEntities = useTranslations('entities.withdrawals');
  const tCommon = useTranslations('common');
  const [expanded, setExpanded] = useState(batch.status === 'pending');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const approve = useApproveWithdrawalBatch();
  const reject = useRejectWithdrawalBatch();
  const brandName =
    tenantNames.get(batch.brandRootId) ?? `#${batch.brandRootId}`;

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(batch.id);
      toast.success(t('batchApproved'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync({
        id: batch.id,
        reason: rejectReason.trim() || undefined,
      });
      toast.success(t('batchRejected'));
      setRejectOpen(false);
      setRejectReason('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {t('batchTitle', { id: batch.id })}
            </p>
            <Badge variant={statusVariant(batch.status)}>
              {tStatus(batch.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {brandName} · {batch.branchCount} {t('branches')} ·{' '}
            {batch.totalAmount.toLocaleString()}₮ ·{' '}
            {new Date(batch.createdAt).toLocaleString()}
          </p>
        </div>
        {batch.status === 'pending' ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={approve.isPending}
              onClick={() => void handleApprove()}
            >
              {approve.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {t('approve')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={reject.isPending}
              onClick={() => setRejectOpen(true)}
            >
              {t('reject')}
            </Button>
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div className="border-t px-4 py-3">
          <ul className="space-y-2">
            {(batch.requests ?? []).map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <Button
                  variant="link"
                  className="h-auto min-h-11 p-0"
                  asChild
                >
                  <Link href={ROUTES.platformWithdrawal(request.id)}>
                    #{request.id} ·{' '}
                    {tenantNames.get(request.tenantId) ??
                      `#${request.tenantId}`}
                  </Link>
                </Button>
                <span className="text-muted-foreground">
                  {request.amount.toLocaleString()}₮ ·{' '}
                  {tStatus(request.status)}
                </span>
              </li>
            ))}
            {(batch.requests ?? []).length === 0 ? (
              <li className="text-muted-foreground text-sm">
                {tEntities('empty')}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setRejectReason('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reject')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('batchRejectConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`batch-reject-${batch.id}`}>
              {t('rejectReason')}
            </Label>
            <Textarea
              id={`batch-reject-${batch.id}`}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder={t('rejectReasonPlaceholder')}
              rows={3}
              maxLength={500}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reject.isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleReject()}
              disabled={reject.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {reject.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {t('reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
  const { data, isLoading, isError, error, refetch } =
    useWithdrawals(apiParams);
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
              <BatchCard
                key={batch.id}
                batch={batch}
                tenantNames={tenantNames}
              />
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          {batches.length > 0 ? (
            <h3 className="text-sm font-medium">
              {tFilter('standaloneHeading')}
            </h3>
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
