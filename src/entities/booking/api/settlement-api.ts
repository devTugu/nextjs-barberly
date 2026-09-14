import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type { BookingOutput } from '../types/booking';

export type OfflineSettlementMethod = 'cash' | 'card';

/** Framework-free BFF call — no React Query. */
export async function postOfflineSettlement(
  tenant: string,
  bookingId: number,
  method: OfflineSettlementMethod,
): Promise<{ booking: BookingOutput }> {
  return api.post<{ booking: BookingOutput }>(
    API_ENDPOINTS.BOOKINGS.OFFLINE_SETTLEMENT(bookingId),
    { method },
    { params: tenantQueryParams(tenant) },
  );
}

/** Framework-free BFF call — no React Query. */
export async function postReopenSettlement(
  tenant: string,
  bookingId: number,
): Promise<BookingOutput> {
  return api.post<BookingOutput>(
    API_ENDPOINTS.BOOKINGS.REOPEN_SETTLEMENT(bookingId),
    undefined,
    { params: tenantQueryParams(tenant) },
  );
}
