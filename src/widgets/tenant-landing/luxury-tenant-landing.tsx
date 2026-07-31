'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Scissors,
  Sofa,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TenantLandingContent } from '@/entities/tenant/types/landing-content';
import { CustomerBranchPicker } from '@/features/user-portal/ui/customer-branch-picker';
import { ROUTES } from '@/shared/config/routes';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Button } from '@/shared/ui/button';
import { TenantBrandBootstrap } from '@/shared/ui/tenant-brand-bootstrap';
import { TenantLandingShell, useTenantLanding } from './tenant-landing-context';
import type { TenantLandingService } from './tenant-landing-hero';

const FEATURE_ICONS = [Scissors, Sofa, Sparkles, Clock] as const;

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
  const { session, handleBookClick } = useTenantLanding();

  const heroImage = settings?.bannerUrl;
  const aboutImage = landingContent.aboutImageUrl ?? settings?.bannerUrl;
  const pricingImage = landingContent.pricingImageUrl ?? settings?.bannerUrl;
  const features = landingContent.features ?? [];
  const priceServices = services.slice(0, 6);
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
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
            <Link href={ROUTES.HOME} className="shrink-0">
              <BrandLogo
                name={tenantName}
                logoUrl={settings?.logoUrl}
                showName
                className="text-xs font-bold uppercase tracking-[0.2em]"
                imageClassName="h-7"
              />
            </Link>
            <nav className="flex flex-1 gap-4 overflow-x-auto text-[10px] font-medium uppercase tracking-[0.18em] text-white/60 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="shrink-0 hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>
            {isLoggedIn ? (
              <Link
                href={ROUTES.USER_DASHBOARD}
                className="shrink-0 text-[10px] font-medium uppercase tracking-[0.15em] text-white/70 hover:text-white"
              >
                {t('myBookings')}
              </Link>
            ) : (
              <Button
                type="button"
                size="sm"
                className={cn('shrink-0 rounded-none text-[10px] uppercase tracking-[0.15em]', brandPrimaryButtonClass)}
                onClick={() => void handleBookClick()}
              >
                {t('bookAppointment')}
              </Button>
            )}
          </div>
        </header>

        <CustomerBranchPicker
          preferBookable
          path={ROUTES.HOME}
          className="border-b border-white/5 px-4 py-2"
        />

        <aside className="pointer-events-none fixed bottom-0 left-0 top-0 z-30 hidden w-20 flex-col items-center justify-between border-r border-white/10 py-10 lg:flex">
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/50 [writing-mode:vertical-rl] rotate-180">
            {landingContent.verticalLabel ?? 'INSIGHT'}
          </span>
          <span className="text-3xl font-black uppercase tracking-tight [writing-mode:vertical-rl] rotate-180 xl:text-4xl">
            {landingContent.sidebarBrandName ?? 'BARBER'}
          </span>
          <span className="text-[10px] text-white/40 [writing-mode:vertical-rl] rotate-180">
            {landingContent.establishedYear ?? 'EST. 2023'}
          </span>
        </aside>

        <section id="hero" className="scroll-mt-24 border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
            <div className="relative min-h-[420px] overflow-hidden bg-zinc-900">
              {heroImage ? (
                <Image src={heroImage} alt="" fill className="object-cover" unoptimized priority />
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
                  <Button
                    type="button"
                    onClick={() => void handleBookClick()}
                    className={cn('rounded-none px-8 uppercase tracking-wider', brandPrimaryButtonClass)}
                  >
                    {t('bookAppointment')}
                  </Button>
                  <Button asChild variant="outline" className="rounded-none border-white/30 bg-transparent uppercase tracking-wider text-white hover:bg-white/10">
                    <a href="#prices">{t('navPrices')}</a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3">
              {priceServices.length > 0 ? (
                priceServices.slice(0, 4).map((service, index) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-4 border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden bg-zinc-800">
                      {heroImage ? (
                        <Image src={heroImage} alt="" fill className="object-cover" unoptimized />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-white/40">
                        {String(index + 1).padStart(2, '0')}
                      </p>
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

        <section id="about" className="scroll-mt-24 border-b border-white/10 py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">
                {landingContent.aboutTitle ?? t('navAbout')}
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-white/65 md:text-base">
                {landingContent.aboutDescription}
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
              {aboutImage ? (
                <Image src={aboutImage} alt="" fill className="object-cover" unoptimized />
              ) : null}
            </div>
          </div>
        </section>

        {priceServices.length > 0 ? (
          <section id="prices" className="scroll-mt-24 border-b border-white/10 py-16 md:py-24">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">{t('navPrices')}</h2>
                <ul className="mt-8 divide-y divide-white/10">
                  {priceServices.map((service) => (
                    <li key={service.id} className="flex items-start justify-between gap-4 py-5">
                      <div>
                        <p className="font-semibold uppercase tracking-wide">{service.name}</p>
                        <p className="mt-1 text-sm text-white/45">
                          {service.durationMinutes} min
                        </p>
                      </div>
                      <p className="shrink-0 text-[var(--brand-primary,#d4b896)]">
                        {service.price.toLocaleString()}₮
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-[320px] overflow-hidden bg-zinc-900">
                {pricingImage ? (
                  <Image src={pricingImage} alt="" fill className="object-cover" unoptimized />
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section id="contact" className="scroll-mt-24 border-b border-white/10 py-12">
          <div className="mx-auto max-w-7xl px-4 text-sm text-white/65 md:px-8">
            {settings?.phone ? (
              <p>
                {t('phone')}:{' '}
                <a href={`tel:${settings.phone}`} className="text-white underline">
                  {settings.phone}
                </a>
              </p>
            ) : null}
            {settings?.address ? (
              <p className="mt-2">
                {t('address')}: {settings.address}
              </p>
            ) : null}
            {openingHoursSummary ? (
              <p className="mt-2">
                {t('openingHours')}: {openingHoursSummary}
              </p>
            ) : null}
            {scheduleDays.length > 0 ? (
              <ul className="mt-4 space-y-1">
                {scheduleDays.map((day) => (
                  <li key={day.dayOfWeek}>
                    <span className="text-white">{day.label}</span>
                    {': '}
                    {day.closed
                      ? t('closedDay')
                      : day.blocks.map((b) => `${b.startTime}–${b.endTime}`).join(', ')}
                  </li>
                ))}
              </ul>
            ) : null}
            {upcomingHolidays.length > 0 ? (
              <div className="mt-4">
                <p className="font-medium text-white">{t('upcomingHolidays')}</p>
                <ul className="mt-2 space-y-1">
                  {upcomingHolidays.slice(0, 5).map((h) => (
                    <li key={h.localDate}>
                      {h.localDate}: {h.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 py-12">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="text-lg font-semibold uppercase tracking-wider">{t('navFaq')}</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/65">{landingContent.faqAnswer}</p>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {tenantName}
        </footer>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center px-1 py-2 text-[9px] uppercase tracking-[0.12em] text-white/55"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => void handleBookClick()}
              className="flex flex-1 flex-col items-center px-1 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary,#d4b896)]"
            >
              {t('bookAppointment')}
            </button>
          </div>
        </nav>
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
