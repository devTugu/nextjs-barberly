'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTenants, type Tenant } from '@/entities/tenant';
import { useTenantColumns } from '@/entities/tenant';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { ROUTES } from '@/shared/config/routes';
import { tenantAdminUrl } from '@/shared/lib/tenant-url';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { AdminTableActions } from '@/shared/ui/admin-table-actions';
import {
  DataTable,
  DataTableToolbar,
  DataTableEmpty,
  DataTableQueryState,
} from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { TenantDeleteDialog } from './tenant-delete-dialog';

export function TenantsTable() {
  const t = useTranslations('entities.tenants');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { can } = useAuthPermissions();
  const tenantColumns = useTenantColumns();
  const { pagination, setPagination, onSearchChange, queryParams, search } =
    useTableSearchParams();
  const { data, isLoading, isError, error, refetch } = useTenants(queryParams);
  const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);

  const columns = useMemo<ColumnDef<Tenant, unknown>[]>(
    () => [
      {
        accessorKey: 'subdomain',
        header: tenantColumns[0]?.header,
        cell: ({ row }) => (
          <Link
            href={ROUTES.platformTenant(row.original.id)}
            className="font-medium hover:underline"
          >
            {row.original.subdomain}
          </Link>
        ),
      },
      {
        accessorKey: 'name',
        header: tenantColumns[1]?.header,
        cell: ({ row }) => (
          <Link
            href={ROUTES.platformTenant(row.original.id)}
            className="hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      ...tenantColumns.slice(2),
      {
        id: 'shop',
        header: () => <span className="sr-only">{t('openShop')}</span>,
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={tenantAdminUrl(row.original.subdomain, ROUTES.ADMIN_BOOKINGS)}>
              <ExternalLink className="mr-1 size-3.5" />
              {t('openShop')}
            </Link>
          </Button>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{tCommon('actions')}</span>,
        cell: ({ row }) => (
          <AdminTableActions
            name={row.original.name}
            canEdit={can(PERMISSION_CODES.TENANT_UPDATE)}
            canDelete={can(PERMISSION_CODES.TENANT_DELETE)}
            onEdit={() =>
              router.push(ROUTES.platformTenantEdit(row.original.id))
            }
            onDelete={() => setDeleteTenant(row.original)}
          />
        ),
      },
    ],
    [tenantColumns, t, tCommon, router],
  );

  const canCreate = can(PERMISSION_CODES.TENANT_CREATE);

  return (
    <DataTableQueryState isError={isError} error={error} refetch={refetch}>
      <div className="space-y-4">
        <DataTableToolbar
          initialSearch={search}
          onSearchChange={onSearchChange}
          placeholder={t('searchPlaceholder')}
        >
          {canCreate ? (
            <Button size="sm" asChild>
              <Link href={ROUTES.PLATFORM_TENANTS_NEW}>{t('addTenant')}</Link>
            </Button>
          ) : null}
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          pageCount={data?.totalPages ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          emptyContent={
            <DataTableEmpty
              title={t('emptyTitle')}
              action={
                canCreate ? (
                  <Button size="sm" asChild>
                    <Link href={ROUTES.PLATFORM_TENANTS_NEW}>
                      {t('addTenant')}
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          }
        />
        <TenantDeleteDialog
          tenant={deleteTenant}
          open={Boolean(deleteTenant)}
          onOpenChange={(open) => !open && setDeleteTenant(null)}
        />
      </div>
    </DataTableQueryState>
  );
}
