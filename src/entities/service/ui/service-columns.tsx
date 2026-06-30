'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/badge';
import type { ServiceOutput } from '../types/service';

export function useServiceColumns() {
  const t = useTranslations('table');
  const tStatus = useTranslations('status');

  return useMemo<ColumnDef<ServiceOutput, unknown>[]>(
    () => [
      { accessorKey: 'name', header: t('name') },
      {
        accessorKey: 'durationMinutes',
        header: t('duration'),
        cell: ({ row }) => `${row.original.durationMinutes} min`,
      },
      {
        accessorKey: 'price',
        header: t('price'),
        cell: ({ row }) => `${row.original.price.toLocaleString()}₮`,
      },
      {
        accessorKey: 'isActive',
        header: t('status'),
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? tStatus('active') : tStatus('inactive')}
          </Badge>
        ),
      },
    ],
    [t, tStatus],
  );
}
