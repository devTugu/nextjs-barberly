import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveHostContext } from '@/shared/lib/host-context';
import {
  buildMarketingMetadata,
  loadPlatformLanding,
  loadTenantMarketingContext,
  resolvePlatformLoginUrl,
  tenantExists,
} from '@/entities/tenant';
import { DEFAULT_TENANT_LANDING } from '@/entities/tenant';
import { PlatformLandingPage } from '@/widgets/platform-landing';
import { LuxuryTenantLanding } from '@/widgets/tenant-landing';

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get('host') ?? 'localhost:3000';
  return buildMarketingMetadata(host);
}

export default async function HomePage() {
  const host = (await headers()).get('host') ?? 'localhost:3000';
  const ctx = resolveHostContext(host);
  const subdomain = ctx.subdomain;

  const showPlatform =
    ctx.scope === 'platform' ||
    !subdomain ||
    !(await tenantExists(subdomain));

  if (showPlatform) {
    const content = await loadPlatformLanding();
    return (
      <PlatformLandingPage
        content={content}
        platformLoginUrl={resolvePlatformLoginUrl(host)}
      />
    );
  }

  const data = await loadTenantMarketingContext(subdomain);
  const landingContent = {
    ...DEFAULT_TENANT_LANDING,
    ...(data.settings?.landingContent ?? {}),
  };

  return (
    <LuxuryTenantLanding
      tenantName={data.name}
      settings={data.settings}
      landingContent={landingContent}
      services={data.services}
      openingHoursSummary={data.openingHoursSummary}
      scheduleDays={data.scheduleDays}
      upcomingHolidays={data.upcomingHolidays}
    />
  );
}
