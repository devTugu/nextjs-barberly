'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  BOOKING_STATUSES,
  type BookingOutput,
  useBookings,
} from '@/entities/booking';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import {
  DataTable,
  DataTableEmpty,
  DataTableQueryState,
} from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useBookingColumns } from '@/entities/booking';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

import { BookingActionsMenu } from './booking-actions-menu';
import { ManualBookingSheet } from './manual-booking-sheet';

function dateToUtcRange(fromDate?: string, toDate?: string) {
  const range: { fromUtc?: string; toUtc?: string } = {};
  if (fromDate) {
    range.fromUtc = new Date(`${fromDate}T00:00:00.000Z`).toISOString();
  }
  if (toDate) {
    const end = new Date(`${toDate}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    range.toUtc = end.toISOString();
  }
  return range;
}

export function BookingsTable() {
  const t = useTranslations('entities.bookings');
  const tTable = useTranslations('table');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = useAuthPermissions();
  const bookingColumns = useBookingColumns();
  const { pagination, setPagination, filters, setFilter, queryParams } =
    useTableSearchParams({
      filterParams: {
        status: { defaultValue: '' },
        fromDate: { defaultValue: '' },
        toDate: { defaultValue: '' },
      },
    });
  const status = filters.status;
  const fromDate = filters.fromDate;
  const toDate = filters.toDate;
  const dateRange = useMemo(
    () => dateToUtcRange(fromDate || undefined, toDate || undefined),
    [fromDate, toDate],
  );
  const apiParams = useMemo(
    () => ({
      page: Number(queryParams.page) || 1,
      limit: Number(queryParams.limit) || 20,
      ...(status ? { status } : {}),
      ...dateRange,
    }),
    [queryParams.page, queryParams.limit, status, dateRange],
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

  const filterToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    const params = new URLSearchParams(searchParams.toString());
    params.set('fromDate', today);
    params.set('toDate', today);
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

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
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="bookings-from-date" className="text-xs">
                  {t('dateFrom')}
                </Label>
                <Input
                  id="bookings-from-date"
                  type="date"
                  className="w-[160px]"
                  value={fromDate}
                  onChange={(event) => setFilter('fromDate', event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bookings-to-date" className="text-xs">
                  {t('dateTo')}
                </Label>
                <Input
                  id="bookings-to-date"
                  type="date"
                  className="w-[160px]"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setFilter('toDate', event.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={filterToday}
              >
                {t('today')}
              </Button>
            </div>
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
