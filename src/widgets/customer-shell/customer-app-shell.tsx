'use client';

import { usePathname } from 'next/navigation';
import { CustomerBottomNav } from './customer-bottom-nav';
import { CustomerPwaBootstrap } from './customer-pwa-bootstrap';
import { CustomerPushPermissionBanner } from './customer-push-permission-banner';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/utils';

interface CustomerAppShellProps {
  children: React.ReactNode;
  /** Hide bottom tab bar (booking wizard). */
  hideNav?: boolean;
}

export function CustomerAppShell({
  children,
  hideNav = false,
}: CustomerAppShellProps) {
  const pathname = usePathname();
  const isBookFlow = pathname.startsWith('/book');
  const isConfirm = pathname.startsWith('/book/confirm');
  const showNav =
    isConfirm ||
    (!hideNav && pathname !== ROUTES.USER_LOGIN && !isBookFlow);

  return (
    <div
      className={cn(
        'customer-app customer-pwa min-h-svh bg-background text-foreground',
        isBookFlow ? 'customer-pwa-light' : 'customer-pwa-dark dark',
      )}
    >
      <CustomerPwaBootstrap />
      <div
        className={
          showNav
            ? 'mx-auto flex min-h-svh w-full max-w-lg flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
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
