'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { fetchCustomerSession, type CustomerSession } from '@/entities/customer';
import { CustomerAuthDialog } from '@/features/customer-auth';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { mutatingFetchHeaders } from '@/shared/lib/csrf-client';
import { publicGet } from '@/shared/lib/public-api';
import { tenantSiteUrl } from '@/shared/lib/tenant-url';
import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';

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
  bookLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
  /** Guest-first: open booking wizard; auth happens at OTP/pay. */
  handleBookClick: () => Promise<void>;
  /** Explicit sign-in for dashboard / profile. */
  handleSignInClick: () => void;
  handleSignOut: () => Promise<void>;
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
  const t = useTranslations('home');
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialStep, setAuthInitialStep] = useState<'phone' | 'name'>(
    'phone',
  );
  const [authRedirectTo, setAuthRedirectTo] = useState<string>(
    ROUTES.USER_DASHBOARD,
  );
  const [bookLoading, setBookLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const prefetchedPath = useRef<string | null>(null);

  const refreshSession = useCallback(async () => {
    const next = await fetchCustomerSession(tenant);
    setSession(next);
    setSessionLoading(false);
  }, [tenant]);

  useEffect(() => {
    let cancelled = false;
    void fetchCustomerSession(tenant)
      .then((next) => {
        if (cancelled) return;
        setSession(next);
        setSessionLoading(false);
      })
      .catch(() => {
        if (!cancelled) setSessionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant]);

  useEffect(() => {
    let cancelled = false;
    void resolveBookEntryPath(tenant).then((path) => {
      if (cancelled) return;
      prefetchedPath.current = path;
      if (!path.startsWith('http')) {
        router.prefetch(path);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router, tenant]);

  const navigateToBook = useCallback(
    async (path: string) => {
      if (path.startsWith('http://') || path.startsWith('https://')) {
        window.location.href = path;
        return;
      }
      startTransition(() => {
        router.push(path);
      });
    },
    [router],
  );

  const handleBookClick = useCallback(async () => {
    setBookLoading(true);
    try {
      const bookPath =
        prefetchedPath.current ?? (await resolveBookEntryPath(tenant));
      prefetchedPath.current = bookPath;
      await navigateToBook(bookPath);
    } catch {
      toast.error(t('bookStartFailed'));
      await navigateToBook(ROUTES.BOOK);
    } finally {
      setBookLoading(false);
    }
  }, [navigateToBook, t, tenant]);

  const handleSignInClick = useCallback(() => {
    setAuthRedirectTo(ROUTES.USER_DASHBOARD);
    setAuthInitialStep(session?.needsProfile ? 'name' : 'phone');
    setAuthOpen(true);
  }, [session]);

  const handleSignOut = useCallback(async () => {
    try {
      const headers = await mutatingFetchHeaders();
      await fetch('/api/customer-auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers,
      });
    } catch {
      /* still clear local session */
    }
    setSession(null);
  }, []);

  const isAuthenticated = Boolean(session && !session.needsProfile);

  const value = useMemo(
    () => ({
      session,
      sessionLoading,
      bookLoading: bookLoading || isPending,
      isAuthenticated,
      refreshSession,
      handleBookClick,
      handleSignInClick,
      handleSignOut,
    }),
    [
      session,
      sessionLoading,
      bookLoading,
      isPending,
      isAuthenticated,
      refreshSession,
      handleBookClick,
      handleSignInClick,
      handleSignOut,
    ],
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
        redirectTo={authRedirectTo}
        onComplete={() => {
          void refreshSession();
        }}
      />
    </TenantLandingContext.Provider>
  );
}
