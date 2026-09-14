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
  const [year] = useState(() => new Date().getFullYear());
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
      <div id="main" className="lg:pl-20">
        <LuxuryLandingChrome
          tenantName={tenantName}
          logoUrl={settings?.logoUrl}
          verticalLabel={landingContent.verticalLabel}
          sidebarBrandName={landingContent.sidebarBrandName}
          establishedYear={landingContent.establishedYear}
          navItems={navItems}
        />
        <div className="border-b border-white/[0.06] bg-neutral-950/80 pt-16 sm:pt-[4.25rem]">
          <CustomerBranchPicker
            preferBookable
            path={ROUTES.HOME}
            className="!space-y-2 border-0 px-5 py-3 text-white sm:px-8 lg:pl-8 [&_button]:border-white/15 [&_button]:bg-white/[0.03] [&_button]:text-white [&_button:hover]:border-white/30 [&_p]:text-white/45"
          />
        </div>
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
        <div className="h-20 sm:hidden" aria-hidden />
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
