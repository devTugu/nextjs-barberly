'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { publicGet } from '@/shared/lib/public-api';
import { tenantSiteUrl } from '@/shared/lib/tenant-url';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { ROUTES } from '@/shared/config/routes';
import { navigateToBranchWithSession } from '@/features/customer-auth/lib/navigate-branch-session';
import { BookingWizardShell } from './booking-wizard-shell';
import { cn } from '@/shared/lib/utils';

export interface PublicBranch {
  id: number;
  subdomain: string;
  name: string;
  address: string | null;
  brandColor: string | null;
  parentTenantId: number | null;
}

interface PublicTenantsResponse {
  items: PublicBranch[];
  bookableItems?: PublicBranch[];
  brandRootSubdomain?: string | null;
}

export function BookBranchStep() {
  const t = useTranslations('bookingWizard');
  const currentTenant = useTenantSubdomain();
  const { data, isLoading } = useQuery({
    queryKey: ['public-tenants-bookable', currentTenant],
    queryFn: () =>
      publicGet<PublicTenantsResponse>('/tenants', currentTenant),
    enabled: Boolean(currentTenant),
  });

  const bookable = data?.bookableItems ?? data?.items ?? [];

  useEffect(() => {
    if (!data || !currentTenant) return;
    if (bookable.length === 0) return;
    if (bookable.length === 1) {
      const only = bookable[0]!;
      void navigateToBranchWithSession(only.subdomain, ROUTES.BOOK);
    }
  }, [bookable, currentTenant, data]);

  if (isLoading || bookable.length <= 1) {
    return (
      <BookingWizardShell step={0} title={t('branch.title')} backHref="/">
        <p className="text-center text-muted-foreground">{t('branch.loading')}</p>
      </BookingWizardShell>
    );
  }

  return (
    <BookingWizardShell step={0} title={t('branch.title')} backHref="/">
      <p className="mb-4 text-sm text-muted-foreground">{t('branch.subtitle')}</p>
      <ul className="space-y-3">
        {bookable.map((branch) => {
          const active = branch.subdomain === currentTenant;
          return (
            <li key={branch.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
                  active
                    ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)]/10'
                    : 'border-border/70 bg-card hover:border-border',
                )}
                onClick={() =>
                  void navigateToBranchWithSession(
                    branch.subdomain,
                    ROUTES.BOOK,
                  )
                }
              >
                <span className="mt-0.5 rounded-full bg-muted p-2">
                  <MapPin className="size-4" />
                </span>
                <span>
                  <span className="block font-medium">{branch.name}</span>
                  {branch.address ? (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {branch.address}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </BookingWizardShell>
  );
}
