import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { PlatformFinanceTenantRow } from '../types/platform-finance';

const formatMnt = (amount: number) => `${amount.toLocaleString()}₮`;

export const usePlatformFinanceColumns = (): ColumnDef<PlatformFinanceTenantRow>[] => {
  const t = useTranslations('dashboard.finance');

  return [
    {
      accessorKey: 'name',
      header: t('shop'),
      cell: ({ row }) => (
        <div className="min-w-[10rem]">
          <p className="font-medium">{row.original.name}</p>
          <p className="text-muted-foreground text-xs">{row.original.subdomain}</p>
        </div>
      ),
    },
    {
      accessorKey: 'grossPayments',
      header: t('gross'),
      cell: ({ row }) => (
        <span className="tabular-nums">{formatMnt(row.original.grossPayments)}</span>
      ),
    },
    {
      accessorKey: 'platformCommission',
      header: t('commission'),
      cell: ({ row }) => (
        <span className="tabular-nums text-amber-600 dark:text-amber-400">
          {formatMnt(row.original.platformCommission)}
        </span>
      ),
    },
    {
      accessorKey: 'refunds',
      header: t('refunds'),
      cell: ({ row }) => (
        <span className="tabular-nums">{formatMnt(row.original.refunds)}</span>
      ),
    },
    {
      accessorKey: 'withdrawals',
      header: t('withdrawals'),
      cell: ({ row }) => (
        <span className="tabular-nums">{formatMnt(row.original.withdrawals)}</span>
      ),
    },
    {
      accessorKey: 'netToTenant',
      header: t('netToTenant'),
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {formatMnt(row.original.netToTenant)}
        </span>
      ),
    },
    {
      accessorKey: 'currentBalance',
      header: t('walletBalance'),
      cell: ({ row }) => (
        <span className="tabular-nums">{formatMnt(row.original.currentBalance)}</span>
      ),
    },
    {
      accessorKey: 'completedBookings',
      header: t('bookings'),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.completedBookings}</span>
      ),
    },
  ];
};
