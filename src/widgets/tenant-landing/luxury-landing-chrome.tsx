'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { LocaleSwitcher } from '@/shared/i18n/locale-switcher';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/utils';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button } from '@/shared/ui/button';
import { useTenantLanding } from './tenant-landing-context';

interface LuxuryLandingChromeProps {
  tenantName: string;
  logoUrl?: string | null;
  verticalLabel?: string | null;
  sidebarBrandName?: string | null;
  establishedYear?: string | null;
  navItems: Array<{ href: string; label: string }>;
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
  const {
    isAuthenticated,
    bookLoading,
    handleBookClick,
    handleSignInClick,
    handleSignOut,
  } = useTenantLanding();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-950 focus:shadow-lg"
      >
        {t('skipToContent')}
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
          scrolled || menuOpen
            ? 'border-b border-white/10 bg-neutral-950/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.25rem] sm:px-8 lg:pl-28">
          <Link href={ROUTES.HOME} className="min-w-0 shrink-0">
            <BrandLogo
              name={tenantName}
              logoUrl={logoUrl}
              showName
              className="max-w-[11rem] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-white"
              imageClassName="h-7"
            />
          </Link>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label={t('primaryNav')}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>

            {isAuthenticated ? (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden h-9 rounded-full border border-white/15 bg-transparent px-3.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/80 hover:bg-white/5 hover:text-white md:inline-flex"
              >
                <Link href={ROUTES.USER_DASHBOARD}>{t('myBookings')}</Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSignInClick}
                className="hidden h-9 rounded-full px-3 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/70 hover:bg-white/5 hover:text-white sm:inline-flex"
              >
                {t('signIn')}
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              disabled={bookLoading}
              onClick={() => void handleBookClick()}
              className="hidden h-9 rounded-full bg-white px-4 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-950 hover:bg-white/90 sm:inline-flex"
            >
              {bookLoading ? t('openingBook') : t('bookAppointment')}
            </Button>

            {isAuthenticated ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleSignOut()}
                className="hidden h-9 rounded-full px-3 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/55 hover:bg-white/5 hover:text-white md:inline-flex"
              >
                {t('signOut')}
              </Button>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-white hover:bg-white/10 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <aside
        className="pointer-events-none fixed bottom-0 left-0 top-0 z-30 hidden w-20 flex-col items-center justify-between border-r border-white/[0.06] py-12 lg:flex"
        aria-hidden
      >
        <span className="text-[0.6rem] uppercase tracking-[0.35em] text-white/35 [writing-mode:vertical-rl] rotate-180">
          {verticalLabel ?? 'STUDIO'}
        </span>
        <span className="text-2xl font-semibold uppercase tracking-[0.08em] text-white/80 [writing-mode:vertical-rl] rotate-180">
          {sidebarBrandName ?? tenantName}
        </span>
        <span className="text-[0.6rem] tracking-[0.2em] text-white/30 [writing-mode:vertical-rl] rotate-180">
          {establishedYear ?? ''}
        </span>
      </aside>

      <div
        id={menuId}
        hidden={!menuOpen}
        className={cn(
          'fixed inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl transition-opacity duration-300 lg:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="flex h-full flex-col px-5 pb-8 pt-20 sm:px-8">
          <nav className="flex flex-1 flex-col gap-1" aria-label={t('mobileNav')}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-3.5 text-2xl font-light tracking-tight text-white/90 transition-colors hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
            <div className="sm:hidden">
              <LocaleSwitcher />
            </div>
            <Button
              type="button"
              disabled={bookLoading}
              onClick={() => {
                closeMenu();
                void handleBookClick();
              }}
              className="h-12 w-full rounded-full bg-white text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950 hover:bg-white/90"
            >
              {bookLoading ? t('openingBook') : t('bookAppointment')}
            </Button>
            {isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full border-white/20 bg-transparent text-xs uppercase tracking-[0.14em] text-white hover:bg-white/5"
                >
                  <Link href={ROUTES.USER_DASHBOARD} onClick={closeMenu}>
                    {t('myBookings')}
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    closeMenu();
                    void handleSignOut();
                  }}
                  className="h-11 rounded-full border-white/20 bg-transparent text-xs uppercase tracking-[0.14em] text-white hover:bg-white/5"
                >
                  {t('signOut')}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  closeMenu();
                  handleSignInClick();
                }}
                className="h-11 w-full rounded-full border-white/20 bg-transparent text-xs uppercase tracking-[0.14em] text-white hover:bg-white/5"
              >
                {t('signIn')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 p-4 sm:hidden">
        <Button
          type="button"
          disabled={bookLoading}
          onClick={() => void handleBookClick()}
          className="pointer-events-auto h-12 w-full rounded-full bg-white text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950 shadow-lg shadow-black/40 hover:bg-white/90"
        >
          {bookLoading ? t('openingBook') : t('bookAppointment')}
        </Button>
      </div>
    </>
  );
}
