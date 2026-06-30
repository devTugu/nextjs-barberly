'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/badge';
import { getDateLocale } from '@/shared/i18n/messages';
import type { Locale } from '@/shared/i18n/config';
import type { BookingOutput } from '../types/booking';

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'confirmed') return 'default';
  if (status === 'completed') return 'secondary';
  if (status === 'pending_payment') return 'outline';
  return 'destructive';
}

export function useBookingColumns() {
  const t = useTranslations('table');
  const tBooking = useTranslations('entities.bookings');
  const locale = useLocale() as Locale;
  const dateLocale = getDateLocale(locale);

  return useMemo<ColumnDef<BookingOutput, unknown>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      {
        accessorKey: 'startAtUtc',
        header: t('time'),
        cell: ({ row }) =>
          new Date(row.original.startAtUtc).toLocaleString(dateLocale),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>
            {tBooking(`status.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'totalPrice',
        header: t('price'),
        cell: ({ row }) => `${row.original.totalPrice.toLocaleString()}₮`,
      },
      {
        accessorKey: 'staffId',
        header: tBooking('staff'),
        cell: ({ row }) => row.original.staffId,
      },
    ],
    [t, tBooking, dateLocale],
  );
}
