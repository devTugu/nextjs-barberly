'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { WithdrawalRequest } from '@/entities/withdrawal';
import { ROUTES } from '@/shared/config/routes';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { withdrawalStatusVariant } from './withdrawal-status';

export function useWithdrawalColumns(tenantNames: Map<number, string>) {
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
          tenantNames.get(row.original.tenantId) ?? `#${row.original.tenantId}`,
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
          <Badge variant={withdrawalStatusVariant(row.original.status)}>
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
