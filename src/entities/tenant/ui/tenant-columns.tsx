'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/badge';
import type { Tenant } from '../types/tenant';

export function useTenantColumns() {
  const t = useTranslations('table');
  const tStatus = useTranslations('status');

  return useMemo<ColumnDef<Tenant, unknown>[]>(
    () => [
      { accessorKey: 'subdomain', header: t('slug') },
      { accessorKey: 'name', header: t('name') },
      { accessorKey: 'timezone', header: t('timezone') },
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
