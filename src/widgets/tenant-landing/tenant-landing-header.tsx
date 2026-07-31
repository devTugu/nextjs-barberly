'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button } from '@/shared/ui/button';
import { useTenantLanding } from './tenant-landing-context';

interface TenantLandingHeaderProps {
  shopName: string;
  logoUrl?: string | null;
  navItems: Array<{ href: string; label: string }>;
}

export function TenantLandingHeader({
  shopName,
  logoUrl,
  navItems,
}: TenantLandingHeaderProps) {
  const t = useTranslations('home');
  const { session, sessionLoading, handleBookClick } = useTenantLanding();

  const isLoggedIn = Boolean(session && !session.needsProfile);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
        <Link href={ROUTES.HOME} className="min-w-0 shrink-0">
          <BrandLogo
            name={shopName}
            logoUrl={logoUrl}
            showName
            className="max-w-[10rem] text-sm font-bold uppercase tracking-tight md:max-w-[12rem]"
            imageClassName="h-7"
          />
        </Link>

        <nav
          className={cn(
            'flex min-w-0 flex-1 items-center gap-4 overflow-x-auto',
            'text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground',
            '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          )}
          aria-label={t('navAbout')}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="shrink-0">
          {sessionLoading ? (
            <span className="text-xs text-muted-foreground">…</span>
          ) : isLoggedIn ? (
            <Link
              href={ROUTES.USER_DASHBOARD}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              {t('myBookings')}
            </Link>
          ) : (
            <Button
              type="button"
              size="sm"
              className={cn('rounded-xl text-xs font-semibold uppercase', brandPrimaryButtonClass)}
              onClick={() => void handleBookClick()}
            >
              {t('bookAppointment')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
