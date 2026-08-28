import { getTranslations } from 'next-intl/server';
import type { TenantLandingContent } from '@/entities/tenant';
import { buildTenantJsonLd } from '@/entities/tenant';
import { JsonLd } from '@/shared/ui/json-ld';
import { IdleBranchPicker } from './idle-branch-picker';
import { LuxuryLandingChrome } from './luxury-landing-chrome';
import { LuxuryLandingSections } from './luxury-landing-sections';
import { TenantLandingShell } from './tenant-landing-context';
import type {
  TenantLandingService,
  TenantLandingSettings,
  TenantScheduleDay,
} from './tenant-landing-types';

export interface LuxuryTenantLandingProps {
  tenantName: string;
  origin: string;
  settings?: TenantLandingSettings;
  landingContent: TenantLandingContent;
  services: TenantLandingService[];
  openingHoursSummary: string | null;
  scheduleDays?: TenantScheduleDay[];
  upcomingHolidays?: Array<{ localDate: string; name: string }>;
}

export async function LuxuryTenantLanding({
  tenantName,
  origin,
  settings,
  landingContent,
  services,
  openingHoursSummary,
  scheduleDays = [],
  upcomingHolidays = [],
}: LuxuryTenantLandingProps) {
  const t = await getTranslations('home');
  const year = new Date().getFullYear();
  const navItems = [
    { href: '#about', label: t('navAbout') },
    { href: '#prices', label: t('navPrices') },
    { href: '#contact', label: t('navContact') },
    { href: '#faq', label: t('navFaq') },
  ];

  return (
    <TenantLandingShell>
      <div
        className="customer-app dark min-h-svh bg-[#0a0a0a] text-white"
        style={
          settings?.brandColor
            ? ({ '--brand-primary': settings.brandColor } as React.CSSProperties)
            : undefined
        }
      >
        <JsonLd
          data={buildTenantJsonLd({
            origin,
            name: tenantName,
            description:
              landingContent.aboutDescription ??
              landingContent.heroTagline ??
              tenantName,
            telephone: settings?.phone ?? null,
            address: settings?.address ?? null,
            image: settings?.bannerUrl ?? settings?.logoUrl ?? null,
            scheduleDays,
          })}
        />
        <div className="lg:pl-20">
          <LuxuryLandingChrome
            tenantName={tenantName}
            logoUrl={settings?.logoUrl}
            verticalLabel={landingContent.verticalLabel}
            sidebarBrandName={landingContent.sidebarBrandName}
            establishedYear={landingContent.establishedYear}
            navItems={navItems}
          />
          <IdleBranchPicker />
          <LuxuryLandingSections
            landingContent={landingContent}
            settings={settings}
            services={services}
            openingHoursSummary={openingHoursSummary}
            scheduleDays={scheduleDays}
            upcomingHolidays={upcomingHolidays}
            tenantName={tenantName}
            year={year}
            navItems={navItems}
          />
          <div className="h-14 lg:hidden" aria-hidden />
        </div>
      </div>
    </TenantLandingShell>
  );
}
