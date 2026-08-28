import type { TenantLandingContent } from '@/entities/tenant';
import { LuxuryAbout } from './luxury-about';
import { LuxuryContact } from './luxury-contact';
import { LuxuryFaq } from './luxury-faq';
import { LuxuryFooter } from './luxury-footer';
import { LuxuryHero } from './luxury-hero';
import { LuxuryPrices } from './luxury-prices';
import type {
  TenantLandingService,
  TenantLandingSettings,
  TenantNavItem,
  TenantScheduleDay,
} from './tenant-landing-types';

interface LuxuryLandingSectionsProps {
  landingContent: TenantLandingContent;
  settings?: TenantLandingSettings;
  services: TenantLandingService[];
  openingHoursSummary: string | null;
  scheduleDays: TenantScheduleDay[];
  upcomingHolidays: Array<{ localDate: string; name: string }>;
  tenantName: string;
  year: number;
  navItems: TenantNavItem[];
}

export function LuxuryLandingSections({
  landingContent,
  settings,
  services,
  openingHoursSummary,
  scheduleDays,
  upcomingHolidays,
  tenantName,
  year,
  navItems,
}: LuxuryLandingSectionsProps) {
  return (
    <main>
      <LuxuryHero
        tenantName={tenantName}
        landingContent={landingContent}
        settings={settings}
        services={services}
      />
      <LuxuryAbout tenantName={tenantName} landingContent={landingContent} />
      <LuxuryPrices
        tenantName={tenantName}
        services={services}
        pricingImageUrl={landingContent.pricingImageUrl}
      />
      <LuxuryContact
        tenantName={tenantName}
        settings={settings}
        openingHoursSummary={openingHoursSummary}
        scheduleDays={scheduleDays}
        upcomingHolidays={upcomingHolidays}
      />
      <LuxuryFaq faqAnswer={landingContent.faqAnswer} />
      <LuxuryFooter
        tenantName={tenantName}
        settings={settings}
        openingHoursSummary={openingHoursSummary}
        navItems={navItems}
        year={year}
      />
    </main>
  );
}
