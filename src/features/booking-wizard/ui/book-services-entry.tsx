'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BookServicesStep } from '@/features/booking-wizard';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { publicGet } from '@/shared/lib/public-api';
import { tenantSiteUrl } from '@/shared/lib/tenant-url';

interface PublicBranch {
  id: number;
  subdomain: string;
}

interface PublicTenantsResponse {
  items: PublicBranch[];
  bookableItems?: PublicBranch[];
}

/**
 * Brand roots with child branches cannot book on the brand host —
 * send the customer to Select Branch (or the only child).
 */
export function BookServicesEntry() {
  const router = useRouter();
  const currentTenant = useTenantSubdomain();
  const { data, isLoading } = useQuery({
    queryKey: ['public-tenants-book-guard', currentTenant],
    queryFn: () =>
      publicGet<PublicTenantsResponse>('/tenants', currentTenant),
    enabled: Boolean(currentTenant),
  });

  const bookable = data?.bookableItems ?? data?.items ?? [];
  const canBookHere = bookable.some((b) => b.subdomain === currentTenant);

  useEffect(() => {
    if (!data || !currentTenant) return;
    if (canBookHere || bookable.length === 0) return;
    if (bookable.length === 1) {
      window.location.replace(
        tenantSiteUrl(bookable[0]!.subdomain, ROUTES.BOOK),
      );
      return;
    }
    router.replace(ROUTES.BOOK_BRANCH);
  }, [bookable, canBookHere, currentTenant, data, router]);

  if (isLoading || (!canBookHere && bookable.length > 0)) {
    return <p className="p-8 text-center text-muted-foreground">…</p>;
  }

  return <BookServicesStep />;
}
