'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { ROUTES } from '@/shared/config/routes';
import { tenantAdminUrl } from '@/shared/lib/tenant-url';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface TenantMembership {
  tenantId: number;
  subdomain: string;
  name: string;
}

export function TenantSwitcher() {
  const { data } = useQuery({
    queryKey: ['auth', 'my-tenants'],
    queryFn: () =>
      api.get<{ items: TenantMembership[] }>(API_ENDPOINTS.AUTH.MY_TENANTS),
  });

  const items = data?.items ?? [];
  if (items.length <= 1) return null;

  return (
    <Select
      onValueChange={(subdomain) => {
        window.location.href = tenantAdminUrl(subdomain, ROUTES.ADMIN_DASHBOARD);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Switch shop" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.tenantId} value={item.subdomain}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
