export interface PlatformFinanceSummary {
  grossPayments: number;
  platformCommission: number;
  refunds: number;
  withdrawals: number;
  netToTenants: number;
  totalWalletBalance: number;
  completedBookings: number;
  activeTenants: number;
}

export interface PlatformFinanceTenantRow {
  tenantId: number;
  subdomain: string;
  name: string;
  grossPayments: number;
  platformCommission: number;
  refunds: number;
  withdrawals: number;
  netToTenant: number;
  currentBalance: number;
  completedBookings: number;
}

export interface PlatformFinance {
  period: {
    month: string;
    fromUtc: string;
    toUtc: string;
  };
  summary: PlatformFinanceSummary;
  byTenant: PlatformFinanceTenantRow[];
}
