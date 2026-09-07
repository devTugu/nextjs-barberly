'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/routes';

export function CustomerBottomNav() {
  const pathname = usePathname();
  const t = useTranslations('customerShell');
  const homeActive =
    pathname === ROUTES.USER_DASHBOARD || pathname.startsWith('/user/bookings');
  const profileActive = pathname.startsWith(ROUTES.USER_PROFILE);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#12141a]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('navLabel')}
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-8 pb-2 pt-2">
        <Link
          href={ROUTES.USER_DASHBOARD}
          className={cn(
            'flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 text-[11px]',
            homeActive ? 'text-white' : 'text-white/45',
          )}
        >
          <Home className="size-5" aria-hidden />
          <span>{t('home')}</span>
        </Link>

        <Link
          href={ROUTES.BOOK}
          aria-label={t('bookCta')}
          className="-mt-7 flex size-14 items-center justify-center rounded-full bg-[var(--brand-primary,#3b82f6)] text-white shadow-lg shadow-blue-500/30"
        >
          <Plus className="size-7" strokeWidth={2.5} />
        </Link>

        <Link
          href={ROUTES.USER_PROFILE}
          className={cn(
            'flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 text-[11px]',
            profileActive ? 'text-white' : 'text-white/45',
          )}
        >
          <UserRound className="size-5" aria-hidden />
          <span>{t('profile')}</span>
        </Link>
      </div>
    </nav>
  );
}
