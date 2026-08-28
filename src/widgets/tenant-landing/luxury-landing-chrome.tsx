'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { TenantBookButton } from './tenant-book-button';
import { useTenantLanding } from './tenant-landing-context';
import type { TenantNavItem } from './tenant-landing-types';

interface LuxuryLandingChromeProps {
  tenantName: string;
  logoUrl?: string | null;
  verticalLabel?: string | null;
  sidebarBrandName?: string | null;
  establishedYear?: string | null;
  navItems: TenantNavItem[];
}

export function LuxuryLandingChrome({
  tenantName,
  logoUrl,
  verticalLabel,
  sidebarBrandName,
  establishedYear,
  navItems,
}: LuxuryLandingChromeProps) {
  const t = useTranslations('home');
  const { session, handleBookClick } = useTenantLanding();
  const isLoggedIn = Boolean(session && !session.needsProfile);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
          <Link href={ROUTES.HOME} className="shrink-0">
            <BrandLogo
              name={tenantName}
              logoUrl={logoUrl}
              showName
              className="text-xs font-bold uppercase tracking-[0.2em]"
              imageClassName="h-7"
            />
          </Link>
          <nav className="flex flex-1 gap-4 overflow-x-auto text-[10px] font-medium uppercase tracking-[0.18em] text-white/60 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="shrink-0 hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          {isLoggedIn ? (
            <Link
              href={ROUTES.USER_DASHBOARD}
              className="shrink-0 text-[10px] font-medium uppercase tracking-[0.15em] text-white/70 hover:text-white"
            >
              {t('myBookings')}
            </Link>
          ) : (
            <TenantBookButton
              size="sm"
              className="shrink-0 rounded-none text-[10px] uppercase tracking-[0.15em]"
            >
              {t('bookAppointment')}
            </TenantBookButton>
          )}
        </div>
      </header>

      <aside className="pointer-events-none fixed bottom-0 left-0 top-0 z-30 hidden w-20 flex-col items-center justify-between border-r border-white/10 py-10 lg:flex">
        <span className="text-[10px] uppercase tracking-[0.35em] text-white/50 [writing-mode:vertical-rl] rotate-180">
          {verticalLabel ?? 'INSIGHT'}
        </span>
        <span className="text-3xl font-black uppercase tracking-tight [writing-mode:vertical-rl] rotate-180 xl:text-4xl">
          {sidebarBrandName ?? 'BARBER'}
        </span>
        <span className="text-[10px] text-white/65 [writing-mode:vertical-rl] rotate-180">
          {establishedYear ?? 'EST. 2023'}
        </span>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center px-1 py-2 text-[9px] uppercase tracking-[0.12em] text-white/55"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => void handleBookClick()}
            className="flex flex-1 flex-col items-center px-1 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary,#d4b896)]"
          >
            {t('bookAppointment')}
          </button>
        </div>
      </nav>
    </>
  );
}
