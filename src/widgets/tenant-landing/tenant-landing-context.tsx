'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  CustomerAuthDialog,
  fetchCustomerSession,
  type CustomerSession,
} from '@/features/customer-auth';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { publicGet } from '@/shared/lib/public-api';
import { tenantSiteUrl } from '@/shared/lib/tenant-url';
import { CsrfBootstrap } from '@/widgets/csrf-bootstrap/csrf-bootstrap';

interface PublicBranch {
  id: number;
  subdomain: string;
  parentTenantId: number | null;
}

interface PublicTenantsResponse {
  items: PublicBranch[];
  bookableItems?: PublicBranch[];
}

interface TenantLandingContextValue {
  session: CustomerSession | null;
  sessionLoading: boolean;
  refreshSession: () => Promise<void>;
  handleBookClick: () => Promise<void>;
}

const TenantLandingContext = createContext<TenantLandingContextValue | null>(
  null,
);

export function useTenantLanding() {
  const ctx = useContext(TenantLandingContext);
  if (!ctx) {
    throw new Error('useTenantLanding must be used within TenantLandingShell');
  }
  return ctx;
}

async function resolveBookEntryPath(currentTenant: string): Promise<string> {
  try {
    const data = await publicGet<PublicTenantsResponse>(
      '/tenants',
      currentTenant,
    );
    const bookable = data.bookableItems ?? data.items ?? [];
    if (bookable.length > 1) {
      return ROUTES.BOOK_BRANCH;
    }
    if (bookable.length === 1 && bookable[0]!.subdomain !== currentTenant) {
      return tenantSiteUrl(bookable[0]!.subdomain, ROUTES.BOOK);
    }
  } catch {
    /* fall through to local book */
  }
  return ROUTES.BOOK;
}

interface TenantLandingShellProps {
  children: React.ReactNode;
}

export function TenantLandingShell({ children }: TenantLandingShellProps) {
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialStep, setAuthInitialStep] = useState<'phone' | 'name'>(
    'phone',
  );
  const [pendingBookPath, setPendingBookPath] = useState(ROUTES.BOOK);

  const refreshSession = useCallback(async () => {
    const next = await fetchCustomerSession(tenant);
    setSession(next);
    setSessionLoading(false);
  }, [tenant]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const navigateToBook = useCallback(
    async (path: string) => {
      if (path.startsWith('http://') || path.startsWith('https://')) {
        window.location.href = path;
        return;
      }
      router.push(path);
    },
    [router],
  );

  const handleBookClick = useCallback(async () => {
    const bookPath = await resolveBookEntryPath(tenant);
    setPendingBookPath(bookPath);

    const current = session ?? (await fetchCustomerSession(tenant));
    if (current && !current.needsProfile) {
      await navigateToBook(bookPath);
      return;
    }
    setAuthInitialStep(current?.needsProfile ? 'name' : 'phone');
    setAuthOpen(true);
  }, [navigateToBook, session, tenant]);

  const value = useMemo(
    () => ({
      session,
      sessionLoading,
      refreshSession,
      handleBookClick,
    }),
    [session, sessionLoading, refreshSession, handleBookClick],
  );

  return (
    <TenantLandingContext.Provider value={value}>
      <CsrfBootstrap />
      {children}
      <CustomerAuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        tenant={tenant}
        initialStep={authInitialStep}
        redirectTo={pendingBookPath}
        onComplete={() => {
          void refreshSession();
        }}
      />
    </TenantLandingContext.Provider>
  );
}
