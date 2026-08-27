'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useAuditLogs, type AuditLogOutput } from '@/entities/audit-log';
import { useTenant } from '@/entities/tenant';
import { ROUTES } from '@/shared/config/routes';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { Button } from '@/shared/ui/button';
import {
  DataTable,
  DataTableToolbar,
  DataTableEmpty,
  DataTableQueryState,
} from '@/shared/ui/data-table';

export function AuditLogsTable() {
  const t = useTranslations('entities.auditLogs');
  const tTable = useTranslations('table');
  const searchParams = useSearchParams();
  const tenantIdParam = searchParams.get('tenantId') ?? '';
  const tenantId = tenantIdParam ? Number(tenantIdParam) : 0;
  const { data: tenant } = useTenant(tenantId, tenantId > 0);
  const { pagination, setPagination, onSearchChange, queryParams, search } =
    useTableSearchParams();

  const apiParams = useMemo(
    () => ({
      ...queryParams,
      ...(tenantId > 0 ? { tenantId } : {}),
    }),
    [queryParams, tenantId],
  );

  const { data, isLoading, isError, error, refetch } = useAuditLogs(apiParams);

  const columns = useMemo<ColumnDef<AuditLogOutput, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: tTable('time'),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
      { accessorKey: 'action', header: tTable('action') },
      { accessorKey: 'resource', header: tTable('resource') },
      { accessorKey: 'resourceId', header: tTable('resourceId') },
      { accessorKey: 'userId', header: tTable('userId') },
      { accessorKey: 'ipAddress', header: tTable('ip') },
    ],
    [tTable],
  );

  return (
    <div className="space-y-4">
      {tenantId > 0 ? (
        <div className="bg-muted/50 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
          <p>
            {t('tenantFilterLabel', {
              name: tenant?.name ?? `#${tenantId}`,
            })}
          </p>
          <Button variant="outline" size="sm" className="min-h-9" asChild>
            <Link href={ROUTES.PLATFORM_AUDIT}>{t('tenantFilterClear')}</Link>
          </Button>
        </div>
      ) : null}
      <DataTableToolbar
        initialSearch={search}
        onSearchChange={onSearchChange}
        placeholder={t('searchPlaceholder')}
      />
      <DataTableQueryState isError={isError} error={error} refetch={refetch}>
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          pageCount={data?.totalPages ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          emptyContent={<DataTableEmpty title={t('emptyTitle')} />}
        />
      </DataTableQueryState>
    </div>
  );
}
