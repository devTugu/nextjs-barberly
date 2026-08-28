import { cache } from 'react';
import type { Metadata } from 'next';
import { DEFAULT_PLATFORM_LANDING, DEFAULT_TENANT_LANDING, type PlatformLandingContent, type TenantLandingContent } from '../types/landing-content';
import { resolveHostContext } from '@/shared/lib/host-context';
import { fetchInternal, parseInternalJson } from '@/shared/lib/internal-api';
import { platformSiteUrl, requestOrigin } from '@/shared/lib/tenant-url';
import { ROUTES } from '@/shared/config/routes';
import { platformLandingSeo, tenantLandingSeo } from './marketing-metadata';

export interface PublicTenantSettings {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  brandColor?: string | null;
  landingContent?: TenantLandingContent | null;
}

interface PublicTenant {
  name: string;
  settings?: PublicTenantSettings;
}

export interface PublicService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface TenantMarketingContext {
  name: string;
  settings?: PublicTenantSettings;
  services: PublicService[];
  openingHoursSummary: string | null;
  scheduleDays: Array<{
    dayOfWeek: number;
    label: string;
    closed: boolean;
    blocks: Array<{ startTime: string; endTime: string }>;
  }>;
  upcomingHolidays: Array<{ localDate: string; name: string }>;
}

export function normalizePlatformLanding(
  raw?: Partial<PlatformLandingContent> | null,
): PlatformLandingContent {
  return {
    ...DEFAULT_PLATFORM_LANDING,
    ...raw,
    features: raw?.features?.length
      ? raw.features
      : DEFAULT_PLATFORM_LANDING.features,
    benefits: raw?.benefits?.length
      ? raw.benefits
      : DEFAULT_PLATFORM_LANDING.benefits,
    partners: raw?.partners?.length
      ? raw.partners
      : DEFAULT_PLATFORM_LANDING.partners,
    testimonials: Array.isArray(raw?.testimonials)
      ? raw.testimonials
      : DEFAULT_PLATFORM_LANDING.testimonials,
    plans: raw?.plans?.length ? raw.plans : DEFAULT_PLATFORM_LANDING.plans,
    contact: {
      ...DEFAULT_PLATFORM_LANDING.contact,
      ...(raw?.contact ?? {}),
    },
  };
}

export const loadPlatformLanding = cache(
  async (): Promise<PlatformLandingContent> => {
    try {
      const res = await fetchInternal('/public/platform/landing');
      if (!res.ok) throw new Error('platform landing unavailable');
      const body = await parseInternalJson<PlatformLandingContent>(res);
      return normalizePlatformLanding(body.data);
    } catch {
      return DEFAULT_PLATFORM_LANDING;
    }
  },
);

export const tenantExists = cache(async (subdomain: string): Promise<boolean> => {
  try {
    const res = await fetchInternal(`/public/tenant?tenant=${subdomain}`);
    return res.ok;
  } catch {
    return false;
  }
});

export async function loadTenantMarketingContext(
  tenant: string,
): Promise<TenantMarketingContext> {
  const [tenantRes, servicesRes, scheduleRes] = await Promise.all([
    fetchInternal(`/public/tenant?tenant=${tenant}`),
    fetchInternal(`/public/services?tenant=${tenant}`),
    fetchInternal(`/public/schedule/summary?tenant=${tenant}`),
  ]);
  const tenantBody = tenantRes.ok
    ? await parseInternalJson<PublicTenant>(tenantRes)
    : null;
  const servicesBody = servicesRes.ok
    ? await parseInternalJson<PublicService[]>(servicesRes)
    : null;
  const scheduleBody = scheduleRes.ok
    ? await parseInternalJson<{
        openingHoursSummary: string | null;
        days: TenantMarketingContext['scheduleDays'];
        upcomingHolidays: TenantMarketingContext['upcomingHolidays'];
      }>(scheduleRes)
    : null;

  return {
    name: tenantBody?.data?.name ?? tenant,
    settings: tenantBody?.data?.settings,
    services: servicesBody?.data ?? [],
    openingHoursSummary: scheduleBody?.data?.openingHoursSummary ?? null,
    scheduleDays: scheduleBody?.data?.days ?? [],
    upcomingHolidays: scheduleBody?.data?.upcomingHolidays ?? [],
  };
}

export function resolvePlatformLoginUrl(host: string): string {
  const ctx = resolveHostContext(host);
  return ctx.scope === 'platform'
    ? ROUTES.PLATFORM_LOGIN
    : platformSiteUrl(ROUTES.PLATFORM_LOGIN);
}

export async function buildMarketingMetadata(
  host: string,
  locale = 'mn',
): Promise<Metadata> {
  const origin = requestOrigin(host);
  const ctx = resolveHostContext(host);
  const subdomain = ctx.subdomain;
  const showPlatform =
    ctx.scope === 'platform' ||
    !subdomain ||
    !(await tenantExists(subdomain));

  if (showPlatform) {
    const content = await loadPlatformLanding();
    return platformLandingSeo(content, origin, locale, 'Barberly');
  }

  const data = await loadTenantMarketingContext(subdomain);
  const landing = {
    ...DEFAULT_TENANT_LANDING,
    ...(data.settings?.landingContent ?? {}),
  };

  return tenantLandingSeo({
    name: data.name,
    tagline: landing.heroTagline,
    about: landing.aboutDescription,
    origin,
    locale,
    imageUrl: data.settings?.bannerUrl ?? data.settings?.logoUrl,
  });
}
