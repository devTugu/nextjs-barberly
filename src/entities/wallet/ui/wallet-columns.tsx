'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/shared/ui/badge';
import { getDateLocale } from '@/shared/i18n/messages';
import type { Locale } from '@/shared/i18n/config';
import type { WalletTransaction } from '../types/wallet';
import { isWalletTxTypeKey } from '../lib/wallet-tx-type';

export function useWalletTransactionColumns() {
  const t = useTranslations('table');
  const tWallet = useTranslations('entities.wallet');
  const locale = useLocale() as Locale;
  const dateLocale = getDateLocale(locale);

  return useMemo<ColumnDef<WalletTransaction, unknown>[]>(
    () => [
      {
        accessorKey: 'type',
        header: t('category'),
        cell: ({ row }) => {
          const type = row.original.type;
          const label = isWalletTxTypeKey(type)
            ? tWallet(`txType.${type}`)
            : type;
          return <Badge variant="outline">{label}</Badge>;
        },
      },
      {
        accessorKey: 'amount',
        header: t('price'),
        cell: ({ row }) => {
          const amount = row.original.amount;
          const formatted = `${Math.abs(amount).toLocaleString()}₮`;
          return (
            <span
              className={
                amount < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
              }
            >
              {amount < 0 ? `−${formatted}` : `+${formatted}`}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('created'),
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString(dateLocale),
      },
    ],
    [t, tWallet, dateLocale],
  );
}
