import Image from 'next/image';
import { Clock, Scissors, Sofa, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { TenantLandingContent } from '@/entities/tenant';
import type { TenantLandingService, TenantLandingSettings } from './tenant-landing-types';
import { TenantBookButton } from './tenant-book-button';

const FEATURE_ICONS = [Scissors, Sofa, Sparkles, Clock] as const;

interface LuxuryHeroProps {
  tenantName: string;
  landingContent: TenantLandingContent;
  settings?: TenantLandingSettings;
  services: TenantLandingService[];
}

export async function LuxuryHero({
  tenantName,
  landingContent,
  settings,
  services,
}: LuxuryHeroProps) {
  const t = await getTranslations('home');
  const heroImage = settings?.bannerUrl;
  const features = landingContent.features ?? [];
  const previewServices = services.slice(0, 4);

  return (
    <section id="hero" className="scroll-mt-24 border-b border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="relative min-h-[420px] overflow-hidden bg-zinc-900">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={`${tenantName} interior`}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">
              {landingContent.heroTagline}
            </p>
            <h1 className="mt-2 max-w-lg text-3xl font-light leading-tight md:text-4xl">
              {landingContent.heroSubtitle}
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <TenantBookButton className="rounded-none px-8 uppercase tracking-wider">
                {t('bookAppointment')}
              </TenantBookButton>
              <a
                href="#prices"
                className="inline-flex items-center rounded-none border border-white/30 bg-transparent px-4 py-2 text-sm font-medium uppercase tracking-wider text-white hover:bg-white/10"
              >
                {t('navPrices')}
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3">
          {previewServices.length > 0 ? (
            previewServices.map((service, index) => (
              <div
                key={service.id}
                className="flex items-center gap-4 border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex size-14 shrink-0 items-center justify-center bg-zinc-800 text-xs text-white/40">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold uppercase tracking-wide">
                    {service.name}
                  </p>
                </div>
                <p className="text-sm font-medium text-[var(--brand-primary,#d4b896)]">
                  {service.price.toLocaleString()}₮
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/50">{t('servicesPreview')}</p>
          )}
        </div>
      </div>
      {features.length > 0 ? (
        <div className="grid border-t border-white/10 md:grid-cols-4">
          {features.slice(0, 4).map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? Scissors;
            return (
              <div
                key={feature.title}
                className="flex flex-col gap-2 border-white/10 p-6 md:border-r md:last:border-r-0"
              >
                <Icon className="size-5 text-[var(--brand-primary,#d4b896)]" />
                <p className="text-xs font-semibold uppercase tracking-wider">{feature.title}</p>
                <p className="text-xs text-white/50">{feature.subtitle}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
