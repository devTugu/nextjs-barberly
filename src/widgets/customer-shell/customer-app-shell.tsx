'use client';

import { usePathname } from 'next/navigation';
import { CustomerBottomNav } from './customer-bottom-nav';
import { CustomerPwaBootstrap } from '@/widgets/customer-pwa/customer-pwa-bootstrap';
import { CustomerPushPermissionBanner } from '@/widgets/customer-pwa/customer-push-permission-banner';
import { TenantBrandBootstrap } from '@/shared/ui/tenant-brand-bootstrap';
import { LocaleSwitcher } from '@/shared/i18n/locale-switcher';
import { ROUTES } from '@/shared/config/routes';

interface CustomerAppShellProps {
  children: React.ReactNode;
  /** Hide bottom tab bar (booking wizard). */
  hideNav?: boolean;
}

export function CustomerAppShell({ children, hideNav = false }: CustomerAppShellProps) {
  const pathname = usePathname();
  const showNav =
    !hideNav && pathname !== ROUTES.USER_LOGIN && !pathname.startsWith('/book/confirm');
  const showLocaleFab =
    showNav || pathname.startsWith('/user/');

  return (
    <div className="customer-app dark min-h-svh bg-background text-foreground">
      <TenantBrandBootstrap />
      <CustomerPwaBootstrap />
      {showLocaleFab ? (
        <div className="pointer-events-none fixed right-3 top-3 z-50 safe-top">
          <div className="pointer-events-auto rounded-full border border-border/60 bg-card/90 p-0.5 shadow-sm backdrop-blur-md">
            <LocaleSwitcher variant="flags" />
          </div>
        </div>
      ) : null}
      <div
        className={
          showNav
            ? 'mx-auto flex min-h-svh w-full max-w-lg flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))]'
            : 'mx-auto flex min-h-svh w-full max-w-lg flex-col'
        }
      >
        {showNav ? <CustomerPushPermissionBanner /> : null}
        {children}
      </div>
      {showNav ? <CustomerBottomNav /> : null}
    </div>
  );
}
