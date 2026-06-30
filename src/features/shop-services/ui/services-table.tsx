'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useServices, type ServiceOutput } from '@/entities/service';
import { useServiceColumns } from '@/entities/service/ui/service-columns';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { useShopTenant } from '@/shared/hooks/use-shop-tenant';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { AdminTableActions } from '@/widgets/admin-table-actions';
import {
  DataTable,
  DataTableToolbar,
  DataTableEmpty,
  DataTableQueryState,
} from '@/widgets/data-table';
import { Button } from '@/shared/ui/button';
import {
  ServiceManageSheet,
  type ServiceSheetState,
} from './service-manage-sheet';
import { ServiceDeleteDialog } from './service-delete-dialog';

export function ServicesTable() {
  const t = useTranslations('entities.services');
  const tCommon = useTranslations('common');
  const tenant = useShopTenant();
  const { can } = useAuthPermissions();
  const serviceColumns = useServiceColumns();
  const { pagination, setPagination, onSearchChange, search } =
    useTableSearchParams();
  const { data: allServices = [], isLoading, isError, error, refetch } =
    useServices(tenant);
  const [sheetState, setSheetState] = useState<ServiceSheetState | null>(null);
  const [deleteService, setDeleteService] = useState<ServiceOutput | null>(
    null,
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allServices;
    return allServices.filter((s) => s.name.toLowerCase().includes(term));
  }, [allServices, search]);

  const pageCount = Math.ceil(filtered.length / pagination.pageSize) || 1;
  const paginated = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination]);

  const columns = useMemo<ColumnDef<ServiceOutput, unknown>[]>(
    () => [
      ...serviceColumns,
      {
        id: 'actions',
        header: () => <span className="sr-only">{tCommon('actions')}</span>,
        cell: ({ row }) => (
          <AdminTableActions
            name={row.original.name}
            updatePermission={PERMISSION_CODES.SERVICE_UPDATE}
            deletePermission={PERMISSION_CODES.SERVICE_DELETE}
            onEdit={() =>
              setSheetState({ mode: 'edit', service: row.original })
            }
            onDelete={() => setDeleteService(row.original)}
          />
        ),
      },
    ],
    [serviceColumns, tCommon],
  );

  const canCreate = can(PERMISSION_CODES.SERVICE_CREATE);

  return (
    <DataTableQueryState isError={isError} error={error} refetch={refetch}>
      <div className="space-y-4">
        <DataTableToolbar
          initialSearch={search}
          onSearchChange={onSearchChange}
          placeholder={t('searchPlaceholder')}
        >
          {canCreate ? (
            <Button
              size="sm"
              onClick={() => setSheetState({ mode: 'create' })}
            >
              {t('addService')}
            </Button>
          ) : null}
        </DataTableToolbar>
        <DataTable
          columns={columns}
          data={paginated}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          emptyContent={
            <DataTableEmpty
              title={t('emptyTitle')}
              action={
                canCreate ? (
                  <Button
                    size="sm"
                    onClick={() => setSheetState({ mode: 'create' })}
                  >
                    {t('addService')}
                  </Button>
                ) : undefined
              }
            />
          }
        />
        <ServiceManageSheet
          state={sheetState}
          onOpenChange={(open) => !open && setSheetState(null)}
        />
        <ServiceDeleteDialog
          service={deleteService}
          open={Boolean(deleteService)}
          onOpenChange={(open) => !open && setDeleteService(null)}
        />
      </div>
    </DataTableQueryState>
  );
}
