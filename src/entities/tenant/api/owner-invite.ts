'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';

export function useSendOwnerInvite() {
  return useMutation({
    mutationFn: ({ tenantId, email }: { tenantId: number; email: string }) =>
      api.post(API_ENDPOINTS.PLATFORM.TENANTS_OWNER_INVITE(tenantId), { email }),
  });
}
