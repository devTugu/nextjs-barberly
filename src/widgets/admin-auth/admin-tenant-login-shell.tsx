import { headers } from 'next/headers';
import { env } from '@/shared/config/env';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { resolveTenantSubdomain } from '@/shared/lib/host-context';
import { AdminTenantLoginClient } from './admin-tenant-login-client';

interface PublicTenant {
  name: string;
  settings?: {
    logoUrl?: string | null;
    brandColor?: string | null;
  };
}

interface AdminTenantLoginShellProps {
  queryTenant?: string;
}

async function loadTenant(tenant: string): Promise<PublicTenant | null> {
  try {
    const response = await fetchInternal(`/public/tenant?tenant=${tenant}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const body = await parseInternalJson<PublicTenant>(response);
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function AdminTenantLoginShell({
  queryTenant,
}: AdminTenantLoginShellProps) {
  const headerStore = await headers();
  const host = headerStore.get('host') ?? 'localhost:3000';
  const tenantSubdomain = resolveTenantSubdomain(host, queryTenant);
  const tenant = await loadTenant(tenantSubdomain);

  return (
    <AdminTenantLoginClient
      tenantName={tenant?.name ?? env.APP_NAME}
      logoUrl={tenant?.settings?.logoUrl}
      brandColor={tenant?.settings?.brandColor}
    />
  );
}
