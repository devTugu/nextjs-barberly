'use client';

import Image from 'next/image';
import {
  Clock,
  Scissors,
  Sofa,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TenantLandingContent } from '@/entities/tenant';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useTenantLanding } from './tenant-landing-context';
import type { TenantLandingService } from './tenant-landing-hero';

const FEATURE_ICONS = [Scissors, Sofa, Sparkles, Clock] as const;

interface LandingSettings {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  brandColor?: string | null;
}

interface ScheduleDay {
  dayOfWeek: number;
  label: string;
  closed: boolean;
  blocks: Array<{ startTime: string; endTime: string }>;
}

interface LuxuryLandingSectionsProps {
  landingContent: TenantLandingContent;
  settings?: LandingSettings;
  services: TenantLandingService[];
  openingHoursSummary: string | null;
  scheduleDays: ScheduleDay[];
  upcomingHolidays: Array<{ localDate: string; name: string }>;
  tenantName: string;
  year: number;
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
}: LuxuryLandingSectionsProps) {
  const t = useTranslations('home');
  const { bookLoading, handleBookClick } = useTenantLanding();
  const heroImage = settings?.bannerUrl;
  const aboutImage = landingContent.aboutImageUrl ?? settings?.bannerUrl;
  const pricingImage = landingContent.pricingImageUrl ?? settings?.bannerUrl;
  const features = landingContent.features ?? [];
  const priceServices = services.slice(0, 6);

  return (
    <>
      <section
        id="hero"
        className="relative isolate min-h-[100svh] overflow-hidden"
      >
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            className="object-cover"
            unoptimized
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#262626_0%,#0a0a0a_55%,#050505_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/20" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.55)_0%,transparent_50%)]" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-28 pt-28 sm:px-8 sm:pb-24 lg:pl-8 lg:pb-28">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-white/70">
            {tenantName}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-light leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            {landingContent.heroSubtitle || landingContent.heroTagline}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
            {landingContent.heroTagline && landingContent.heroSubtitle
              ? landingContent.heroTagline
              : t('ctaDescription')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={bookLoading}
              onClick={() => void handleBookClick()}
              className="h-12 rounded-full bg-white px-8 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-950 hover:bg-white/90"
            >
              {bookLoading ? t('openingBook') : t('bookAppointment')}
            </Button>
            <a
              href="#prices"
              className="inline-flex h-12 items-center rounded-full px-5 text-xs font-medium uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-white"
            >
              {t('navPrices')}
            </a>
          </div>
        </div>
      </section>

      {features.length > 0 ? (
        <section aria-label={t('servicesPreview')} className="border-b border-white/10">
          <div className="mx-auto grid max-w-6xl gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {features.slice(0, 4).map((feature, index) => {
              const Icon = FEATURE_ICONS[index] ?? Scissors;
              return (
                <div key={feature.title} className="bg-neutral-950 px-6 py-8 sm:px-8">
                  <Icon
                    className="size-5 text-[var(--brand-primary,#c4a484)]"
                    aria-hidden
                  />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                    {feature.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {feature.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section id="about" className="scroll-mt-24 border-b border-white/10 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
              {t('navAbout')}
            </p>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl">
              {landingContent.aboutTitle ?? tenantName}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60 sm:text-base">
              {landingContent.aboutDescription}
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 sm:aspect-[4/3]">
            {aboutImage ? (
              <Image src={aboutImage} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
            )}
          </div>
        </div>
      </section>

      {priceServices.length > 0 ? (
        <section id="prices" className="scroll-mt-24 border-b border-white/10 py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                {t('navPrices')}
              </p>
              <h2 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl">
                {t('servicesPreview')}
              </h2>
              <ul className="mt-10 divide-y divide-white/10">
                {priceServices.map((service) => (
                  <li
                    key={service.id}
                    className="flex items-baseline justify-between gap-6 py-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium tracking-wide text-white">
                        {service.name}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {service.durationMinutes} min
                      </p>
                    </div>
                    <p className="shrink-0 text-sm tabular-nums text-[var(--brand-primary,#c4a484)]">
                      {service.price.toLocaleString()}₮
                    </p>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                disabled={bookLoading}
                onClick={() => void handleBookClick()}
                className="mt-8 h-11 rounded-full bg-white px-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-950 hover:bg-white/90"
              >
                {bookLoading ? t('openingBook') : t('bookAppointment')}
              </Button>
            </div>
            <div className="relative min-h-[280px] overflow-hidden bg-neutral-900 lg:min-h-full">
              {pricingImage ? (
                <Image src={pricingImage} alt="" fill className="object-cover" unoptimized />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section id="contact" className="scroll-mt-24 border-b border-white/10 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
            {t('navContact')}
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight text-white sm:text-4xl">
            {t('visitUs')}
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              {settings?.phone ? (
                <p className="text-sm text-white/55">
                  <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                    {t('phone')}
                  </span>
                  <a
                    href={`tel:${settings.phone}`}
                    className="mt-2 inline-block text-base text-white transition-colors hover:text-white/80"
                  >
                    {settings.phone}
                  </a>
                </p>
              ) : null}
              {settings?.address ? (
                <p className={cn('text-sm text-white/55', settings.phone && 'mt-6')}>
                  <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                    {t('address')}
                  </span>
                  <span className="mt-2 block text-base text-white/80">
                    {settings.address}
                  </span>
                </p>
              ) : null}
            </div>

            <div>
              {openingHoursSummary ? (
                <p className="text-sm text-white/55">
                  <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                    {t('openingHours')}
                  </span>
                  <span className="mt-2 block text-base text-white/80">
                    {openingHoursSummary}
                  </span>
                </p>
              ) : null}
              {scheduleDays.length > 0 ? (
                <ul className="mt-4 space-y-1.5 text-sm text-white/50">
                  {scheduleDays.map((day) => (
                    <li key={day.dayOfWeek} className="flex justify-between gap-4">
                      <span className="text-white/70">{day.label}</span>
                      <span className="tabular-nums">
                        {day.closed
                          ? t('closedDay')
                          : day.blocks
                              .map((b) => `${b.startTime}–${b.endTime}`)
                              .join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {upcomingHolidays.length > 0 ? (
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                  {t('upcomingHolidays')}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-white/55">
                  {upcomingHolidays.slice(0, 5).map((holiday) => (
                    <li key={holiday.localDate}>
                      <span className="text-white/80">{holiday.localDate}</span>
                      {': '}
                      {holiday.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
            {t('navFaq')}
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-light tracking-tight text-white sm:text-4xl">
            {t('faqHeading')}
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            {landingContent.faqAnswer}
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {year} {tenantName}
          </p>
          <div className="flex gap-5">
            <a href="#terms" className="transition-colors hover:text-white/70">
              {t('terms')}
            </a>
            <a href="#privacy" className="transition-colors hover:text-white/70">
              {t('privacy')}
            </a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl space-y-6 px-5 pb-16 text-xs leading-relaxed text-white/35 sm:px-8">
          <p id="terms">
            <span className="font-medium text-white/50">{t('terms')}</span>
            {' — '}
            {t('termsBody')}
          </p>
          <p id="privacy">
            <span className="font-medium text-white/50">{t('privacy')}</span>
            {' — '}
            {t('privacyBody')}
          </p>
        </div>
      </footer>
    </>
  );
}
