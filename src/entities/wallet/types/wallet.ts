export interface WalletBalance {
  tenantId: number;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: number;
  tenantId: number;
  bookingId: number | null;
  type: string;
  amount: number;
  reference: string | null;
  createdAt: string;
}

export interface WalletTransactionListResult {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface WithdrawInput {
  amount: number;
  reference?: string;
}
