'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TenantLandingContent } from '@/entities/tenant';
import { CustomerBranchPicker } from '@/features/user-portal';
import { ROUTES } from '@/shared/config/routes';
import { TenantBrandBootstrap } from '@/shared/ui/tenant-brand-bootstrap';
import { LuxuryLandingChrome } from './luxury-landing-chrome';
import { LuxuryLandingSections } from './luxury-landing-sections';
import { TenantLandingShell, useTenantLanding } from './tenant-landing-context';
import type { TenantLandingService } from './tenant-landing-hero';

export interface LuxuryTenantLandingProps {
  tenantName: string;
  settings?: {
    logoUrl?: string | null;
    bannerUrl?: string | null;
    phone?: string | null;
    address?: string | null;
    brandColor?: string | null;
  };
  landingContent: TenantLandingContent;
  services: TenantLandingService[];
  openingHoursSummary: string | null;
  scheduleDays?: Array<{
    dayOfWeek: number;
    label: string;
    closed: boolean;
    blocks: Array<{ startTime: string; endTime: string }>;
  }>;
  upcomingHolidays?: Array<{ localDate: string; name: string }>;
}

function LuxuryTenantLandingBody({
  tenantName,
  settings,
  landingContent,
  services,
  openingHoursSummary,
  scheduleDays = [],
  upcomingHolidays = [],
}: LuxuryTenantLandingProps) {
  const t = useTranslations('home');
  const { session } = useTenantLanding();
  const [year] = useState(() => new Date().getFullYear());
  const isLoggedIn = Boolean(session && !session.needsProfile);
  const navItems = [
    { href: '#about', label: t('navAbout') },
    { href: '#prices', label: t('navPrices') },
    { href: '#contact', label: t('navContact') },
    { href: '#faq', label: t('navFaq') },
  ];

  return (
    <div
      className="customer-app dark min-h-svh bg-[#0a0a0a] text-white"
      style={
        settings?.brandColor
          ? ({ '--brand-primary': settings.brandColor } as React.CSSProperties)
          : undefined
      }
    >
      <TenantBrandBootstrap />
      <div className="lg:pl-20">
        <LuxuryLandingChrome
          tenantName={tenantName}
          logoUrl={settings?.logoUrl}
          verticalLabel={landingContent.verticalLabel}
          sidebarBrandName={landingContent.sidebarBrandName}
          establishedYear={landingContent.establishedYear}
          navItems={navItems}
          isLoggedIn={isLoggedIn}
        />
        <CustomerBranchPicker
          preferBookable
          path={ROUTES.HOME}
          className="border-b border-white/5 px-4 py-2"
        />
        <LuxuryLandingSections
          landingContent={landingContent}
          settings={settings}
          services={services}
          openingHoursSummary={openingHoursSummary}
          scheduleDays={scheduleDays}
          upcomingHolidays={upcomingHolidays}
          tenantName={tenantName}
          year={year}
        />
        <div className="h-14 lg:hidden" aria-hidden />
      </div>
    </div>
  );
}

export function LuxuryTenantLanding(props: LuxuryTenantLandingProps) {
  return (
    <TenantLandingShell>
      <LuxuryTenantLandingBody {...props} />
    </TenantLandingShell>
  );
}
