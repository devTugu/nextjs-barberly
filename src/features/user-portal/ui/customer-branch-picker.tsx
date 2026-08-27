'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { publicGet } from '@/shared/lib/public-api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { ROUTES } from '@/shared/config/routes';
import { navigateToBranchWithSession } from '@/entities/customer';
import { cn } from '@/shared/lib/utils';

export interface PublicBranch {
  id: number;
  subdomain: string;
  name: string;
  address: string | null;
  brandColor: string | null;
  parentTenantId?: number | null;
}

interface PublicTenantsResponse {
  items: PublicBranch[];
  bookableItems?: PublicBranch[];
}

interface CustomerBranchPickerProps {
  className?: string;
  /** Path on the selected branch host. Default: customer dashboard. */
  path?: string;
  /** Prefer physical branches (children) when the brand has them. */
  preferBookable?: boolean;
}

export function CustomerBranchPicker({
  className,
  path = ROUTES.USER_DASHBOARD,
  preferBookable = false,
}: CustomerBranchPickerProps) {
  const t = useTranslations('customerShell');
  const currentTenant = useTenantSubdomain();
  const { data } = useQuery({
    queryKey: ['public-tenants', currentTenant],
    queryFn: () =>
      publicGet<PublicTenantsResponse>('/tenants', currentTenant),
    enabled: Boolean(currentTenant),
  });

  const branches = preferBookable
    ? (data?.bookableItems ?? data?.items ?? [])
    : (data?.items ?? []);
  if (branches.length <= 1) return null;

  return (
    <div className={cn('space-y-2 px-4', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('branch')}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {branches.map((branch) => {
          const active = branch.subdomain === currentTenant;
          return (
            <button
              key={branch.id}
              type="button"
              onClick={() =>
                void navigateToBranchWithSession(branch.subdomain, path)
              }
              className={cn(
                'min-w-[10rem] shrink-0 rounded-2xl border p-3 text-left transition-colors',
                active
                  ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)]/10'
                  : 'border-border/60 bg-card hover:border-border',
              )}
            >
              <p className="font-medium">{branch.name}</p>
              {branch.address ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {branch.address}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
