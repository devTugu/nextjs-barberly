export interface BrandDashboardBranchRow {
  tenantId: number;
  name: string;
  subdomain: string;
  todayBookings: number;
  todayRevenue: number;
  pendingCount: number;
}

export interface BrandDashboardTotals {
  todayBookings: number;
  todayRevenue: number;
  pendingCount: number;
}

export interface BrandDashboard {
  brandRootId: number;
  brandName: string;
  fromUtc: string;
  toUtc: string;
  branches: BrandDashboardBranchRow[];
  totals: BrandDashboardTotals;
}
