import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { tenantQueryParams } from '@/shared/hooks/use-tenant-subdomain';
import type { BookingOutput, ManualBookingInput } from '../types/booking';
import {
  postOfflineSettlement,
  postReopenSettlement,
  type OfflineSettlementMethod,
} from './settlement-api';

export type { OfflineSettlementMethod };

export async function completeBookingCommand(tenant: string, id: number) {
  return api.patch<{ booking: BookingOutput }>(
    API_ENDPOINTS.BOOKINGS.COMPLETE(id),
    undefined,
    { params: tenantQueryParams(tenant) },
  );
}

export async function cancelBookingCommand(tenant: string, id: number) {
  return api.patch<{ booking: BookingOutput }>(
    API_ENDPOINTS.BOOKINGS.CANCEL(id),
    undefined,
    { params: tenantQueryParams(tenant) },
  );
}

export async function noShowBookingCommand(tenant: string, id: number) {
  return api.patch<BookingOutput>(API_ENDPOINTS.BOOKINGS.NO_SHOW(id), undefined, {
    params: tenantQueryParams(tenant),
  });
}

export async function confirmBookingCommand(tenant: string, id: number) {
  return api.patch<BookingOutput>(API_ENDPOINTS.BOOKINGS.CONFIRM(id), undefined, {
    params: tenantQueryParams(tenant),
  });
}

export async function createManualBookingCommand(
  tenant: string,
  data: ManualBookingInput,
) {
  return api.post<BookingOutput>(API_ENDPOINTS.BOOKINGS.MANUAL, data, {
    params: tenantQueryParams(tenant),
  });
}

export async function offlineSettlementCommand(
  tenant: string,
  id: number,
  method: OfflineSettlementMethod,
) {
  return postOfflineSettlement(tenant, id, method);
}

export async function reopenSettlementCommand(tenant: string, id: number) {
  return postReopenSettlement(tenant, id);
}
