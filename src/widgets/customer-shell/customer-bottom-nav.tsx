'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarPlus, Home, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/routes';

const NAV_ITEMS = [
  { href: ROUTES.USER_DASHBOARD, icon: Home, labelKey: 'home' as const },
  { href: ROUTES.BOOK, icon: CalendarPlus, labelKey: 'book' as const },
  { href: ROUTES.USER_PROFILE, icon: UserRound, labelKey: 'profile' as const },
];

export function CustomerBottomNav() {
  const pathname = usePathname();
  const t = useTranslations('customerShell');

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('navLabel')}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
          const active =
            pathname === href ||
            (href === ROUTES.USER_DASHBOARD &&
              pathname.startsWith('/user/bookings'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-11 min-w-[4.5rem] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
                active
                  ? 'text-[var(--brand-primary,#f97316)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('size-5', active && 'fill-current/20')} aria-hidden />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
