'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  BOOKING_STATUSES,
  type BookingOutput,
  useBookings,
} from '@/entities/booking';
import { useBookingColumns } from '@/entities/booking/ui/booking-columns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { BookingActionsMenu } from './booking-actions-menu';
import { ManualBookingSheet } from './manual-booking-sheet';

export function BookingsTable() {
  const t = useTranslations('entities.bookings');
  const tTable = useTranslations('table');
  const tenant = useShopTenant();
  const { can } = useAuthPermissions();
  const bookingColumns = useBookingColumns();
  const { pagination, setPagination, filters, setFilter, queryParams } =
    useTableSearchParams({
      filterParams: { status: { defaultValue: '' } },
    });
  const status = filters.status;
  const apiParams = useMemo(
    () => ({
      page: Number(queryParams.page) || 1,
      limit: Number(queryParams.limit) || 20,
      ...(status ? { status } : {}),
    }),
    [queryParams.page, queryParams.limit, status],
  );
  const { data, isLoading, isError, error, refetch } = useBookings(
    tenant,
    apiParams,
  );
  const [manualOpen, setManualOpen] = useState(false);

  const columns = useMemo<ColumnDef<BookingOutput, unknown>[]>(
    () => [
      ...bookingColumns,
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => <BookingActionsMenu booking={row.original} />,
      },
    ],
    [bookingColumns],
  );

  const canCreate = can(PERMISSION_CODES.BOOKING_CREATE);

  return (
    <DataTableQueryState isError={isError} error={error} refetch={refetch}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Select
              value={status || 'all'}
              onValueChange={(value) =>
                setFilter('status', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={tTable('statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tTable('allStatuses')}</SelectItem>
                {BOOKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {canCreate ? (
            <Button size="sm" onClick={() => setManualOpen(true)}>
              {t('addManual')}
            </Button>
          ) : null}
        </div>
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          pageCount={data?.totalPages ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          emptyContent={<DataTableEmpty title={t('emptyTitle')} />}
        />
        <ManualBookingSheet open={manualOpen} onOpenChange={setManualOpen} />
      </div>
    </DataTableQueryState>
  );
}
