import { getTranslations } from 'next-intl/server';
import type { TenantLandingSettings, TenantScheduleDay } from './tenant-landing-types';
import { TenantBookButton } from './tenant-book-button';

interface LuxuryContactProps {
  tenantName: string;
  settings?: TenantLandingSettings;
  openingHoursSummary: string | null;
  scheduleDays: TenantScheduleDay[];
  upcomingHolidays: Array<{ localDate: string; name: string }>;
}

export async function LuxuryContact({
  tenantName,
  settings,
  openingHoursSummary,
  scheduleDays,
  upcomingHolidays,
}: LuxuryContactProps) {
  const t = await getTranslations('home');
  const mapsHref = settings?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`
    : null;
  const hasNap = Boolean(settings?.phone || settings?.address);

  return (
    <section id="contact" className="scroll-mt-24 border-b border-white/10 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">{t('navContact')}</h2>
          {hasNap ? (
            <div className="mt-6 space-y-3 text-sm text-white/65">
              {settings?.phone ? (
                <p>
                  {t('phone')}:{' '}
                  <a href={`tel:${settings.phone}`} className="text-white underline">
                    {settings.phone}
                  </a>
                </p>
              ) : null}
              {settings?.address ? <p>{t('address')}: {settings.address}</p> : null}
              {openingHoursSummary ? (
                <p>
                  {t('openingHours')}: {openingHoursSummary}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm text-white/65">{t('contactEmpty')}</p>
          )}
          {scheduleDays.length > 0 ? (
            <ul className="mt-6 space-y-1 text-sm text-white/65">
              {scheduleDays.map((day) => (
                <li key={day.dayOfWeek}>
                  <span className="text-white">{day.label}</span>
                  {': '}
                  {day.closed
                    ? t('closedDay')
                    : day.blocks.map((block) => `${block.startTime}–${block.endTime}`).join(', ')}
                </li>
              ))}
            </ul>
          ) : null}
          {upcomingHolidays.length > 0 ? (
            <div className="mt-6 text-sm">
              <p className="font-medium text-white">{t('upcomingHolidays')}</p>
              <ul className="mt-2 space-y-1 text-white/65">
                {upcomingHolidays.slice(0, 5).map((holiday) => (
                  <li key={holiday.localDate}>
                    {holiday.localDate}: {holiday.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-4 border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/65">{tenantName}</p>
          <TenantBookButton className="rounded-none px-8 uppercase tracking-wider">
            {t('bookAppointment')}
          </TenantBookButton>
          {mapsHref ? (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white underline underline-offset-4"
            >
              {t('mapsLink')}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
