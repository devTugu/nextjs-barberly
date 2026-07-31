'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useTenantLanding } from './tenant-landing-context';

export interface TenantLandingService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface TenantLandingHeroProps {
  tenantName: string;
  settings?: {
    logoUrl?: string | null;
    bannerUrl?: string | null;
    phone?: string | null;
    address?: string | null;
    brandColor?: string | null;
  };
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

const sectionClass = 'scroll-mt-24';

export function TenantLandingHero({
  tenantName,
  settings,
  services,
  openingHoursSummary,
  scheduleDays = [],
  upcomingHolidays = [],
}: TenantLandingHeroProps) {
  const t = useTranslations('home');
  const { session, handleBookClick } = useTenantLanding();

  const heroServices = services.slice(0, 2);
  const priceServices = services.slice(0, 6);
  const isLoggedIn = Boolean(session && !session.needsProfile);

  return (
    <div className="text-foreground">
      <section id="hero" className={cn('mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6', sectionClass)}>
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t('heroTagline')}
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl md:text-6xl">
            {tenantName}
          </h1>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="relative aspect-[4/5] min-h-[280px] overflow-hidden rounded-2xl bg-muted">
            {settings?.bannerUrl ? (
              <Image
                src={settings.bannerUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full items-end bg-gradient-to-t from-background/90 to-muted p-6">
                <p className="text-2xl font-bold uppercase">{tenantName}</p>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {heroServices.map((service, index) => (
              <div
                key={service.id}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
              >
                {settings?.bannerUrl && index === 0 ? (
                  <Image
                    src={settings.bannerUrl}
                    alt=""
                    fill
                    className="object-cover object-top"
                    unoptimized
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 bg-background/80 px-3 py-2 text-sm font-medium backdrop-blur-sm">
                  {service.name}
                </div>
              </div>
            ))}
            {heroServices.length === 0 ? (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">
                {t('servicesPreview')}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-end">
          <div
            id="about"
            className={cn('max-w-xl space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base', sectionClass)}
          >
            <p>
              <span className="font-semibold text-foreground">{tenantName}</span>
              {' — '}
              {t('aboutDescription')}
            </p>
            {settings?.phone || settings?.address ? (
              <div id="contact" className={cn('space-y-1 text-sm', sectionClass)}>
                {settings.phone ? (
                  <p>
                    {t('phone')}:{' '}
                    <a href={`tel:${settings.phone}`} className="underline">
                      {settings.phone}
                    </a>
                  </p>
                ) : null}
                {settings.address ? (
                  <p>
                    {t('address')}: {settings.address}
                  </p>
                ) : null}
              </div>
            ) : null}
            {openingHoursSummary ? (
              <div className="space-y-2">
                <p>
                  {t('openingHours')}: {openingHoursSummary}
                </p>
                {scheduleDays.length > 0 ? (
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    {scheduleDays.map((day) => (
                      <li key={day.dayOfWeek}>
                        <span className="font-medium text-foreground">{day.label}</span>
                        {': '}
                        {day.closed
                          ? t('closedDay')
                          : day.blocks
                              .map((block) => `${block.startTime}–${block.endTime}`)
                              .join(', ')}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {upcomingHolidays.length > 0 ? (
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{t('upcomingHolidays')}</p>
                    <ul className="text-muted-foreground mt-1 space-y-1">
                      {upcomingHolidays.slice(0, 5).map((holiday) => (
                        <li key={holiday.localDate}>
                          {holiday.localDate}: {holiday.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('ctaDescription')}
            </p>
            <Button
              type="button"
              onClick={() => void handleBookClick()}
              className={cn('min-h-14 w-full rounded-xl text-base font-semibold uppercase', brandPrimaryButtonClass)}
            >
              {t('bookAppointment')}
            </Button>
            {isLoggedIn ? (
              <Button asChild variant="outline" className="min-h-11 w-full rounded-xl">
                <Link href={ROUTES.USER_DASHBOARD}>{t('myBookings')}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {priceServices.length > 0 ? (
        <section id="prices" className={cn('border-t border-border py-12', sectionClass)}>
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight">
              {t('navPrices')}
            </h2>
            <ul className="divide-y divide-border">
              {priceServices.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between gap-4 py-4 text-sm md:text-base"
                >
                  <span className="font-medium">{service.name}</span>
                  <span className="text-muted-foreground">
                    {service.durationMinutes}m · {service.price.toLocaleString()}₮
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section id="faq" className={cn('border-t border-border py-10', sectionClass)}>
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground md:px-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">{t('navFaq')}</h2>
          <p>{t('faqAnswer')}</p>
        </div>
      </section>
    </div>
  );
}
