'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote,
  CalendarDays,
  Clock,
  Home,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES, type PermissionCode } from '@/shared/config/permissions';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/routes';

type NavItem = {
  href: string;
  icon: typeof Home;
  labelKey: 'home' | 'calendar' | 'wallet' | 'bookings' | 'settings' | 'schedule' | 'earnings';
  permission?: PermissionCode;
  match?: (pathname: string) => boolean;
};

const OWNER_NAV_ITEMS: NavItem[] = [
  {
    href: ROUTES.ADMIN_DASHBOARD,
    icon: Home,
    labelKey: 'home',
    permission: PERMISSION_CODES.BOOKING_READ,
    match: (pathname) =>
      pathname === ROUTES.ADMIN_DASHBOARD || pathname === ROUTES.ADMIN,
  },
  {
    href: ROUTES.ADMIN_CALENDAR,
    icon: CalendarDays,
    labelKey: 'calendar',
    permission: PERMISSION_CODES.BOOKING_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_CALENDAR),
  },
  {
    href: ROUTES.ADMIN_SCHEDULE,
    icon: Clock,
    labelKey: 'schedule',
    permission: PERMISSION_CODES.SCHEDULE_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_SCHEDULE),
  },
  {
    href: ROUTES.ADMIN_WALLET,
    icon: Wallet,
    labelKey: 'wallet',
    permission: PERMISSION_CODES.WALLET_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_WALLET),
  },
  {
    href: ROUTES.ADMIN_BOOKINGS,
    icon: Users,
    labelKey: 'bookings',
    permission: PERMISSION_CODES.BOOKING_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_BOOKINGS),
  },
  {
    href: ROUTES.ADMIN_SETTINGS,
    icon: Settings,
    labelKey: 'settings',
    permission: PERMISSION_CODES.TENANT_SETTINGS_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_SETTINGS),
  },
];

const STAFF_NAV_ITEMS: NavItem[] = [
  {
    href: ROUTES.ADMIN_CALENDAR,
    icon: Home,
    labelKey: 'home',
    permission: PERMISSION_CODES.BOOKING_READ,
    match: (pathname) =>
      pathname === ROUTES.ADMIN_CALENDAR ||
      pathname === ROUTES.ADMIN ||
      pathname === ROUTES.ADMIN_DASHBOARD,
  },
  {
    href: ROUTES.ADMIN_BOOKINGS,
    icon: Users,
    labelKey: 'bookings',
    permission: PERMISSION_CODES.BOOKING_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_BOOKINGS),
  },
  {
    href: ROUTES.ADMIN_SCHEDULE,
    icon: Clock,
    labelKey: 'schedule',
    permission: PERMISSION_CODES.SCHEDULE_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_SCHEDULE),
  },
  {
    href: ROUTES.ADMIN_EARNINGS,
    icon: Banknote,
    labelKey: 'earnings',
    permission: PERMISSION_CODES.DASHBOARD_READ,
    match: (pathname) => pathname.startsWith(ROUTES.ADMIN_EARNINGS),
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const t = useTranslations('adminShell');
  const { can, isStaff } = useAuthPermissions();

  const navItems = isStaff ? STAFF_NAV_ITEMS : OWNER_NAV_ITEMS;
  const visibleItems = navItems.filter(
    (item) => !item.permission || can(item.permission),
  );

  if (visibleItems.length === 0) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('navLabel')}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-2">
        {visibleItems.map(({ href, icon: Icon, labelKey, match }) => {
          const active = match ? match(pathname) : pathname === href;
          return (
            <Link
              key={`${href}-${labelKey}`}
              href={href}
              className={cn(
                'flex min-h-11 min-w-[3.25rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition-colors',
                active
                  ? 'text-[var(--brand-primary,#f97316)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon
                className={cn('size-5', active && 'fill-current/20')}
                aria-hidden
              />
              <span className="truncate">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
