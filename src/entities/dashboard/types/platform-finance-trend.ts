export interface PlatformFinanceTrendPoint {
  month: string;
  grossPayments: number;
  platformCommission: number;
  refunds: number;
  withdrawals: number;
  netToTenants: number;
  completedBookings: number;
}

export interface PlatformFinanceTrend {
  months: number;
  fromUtc: string;
  toUtc: string;
  points: PlatformFinanceTrendPoint[];
}
