import { getTranslations } from 'next-intl/server';
import { configuredSiteOrigin } from '@/shared/lib/tenant-url';
import type { TenantLandingSettings, TenantNavItem } from './tenant-landing-types';
import { TenantBookButton } from './tenant-book-button';

interface LuxuryFooterProps {
  tenantName: string;
  settings?: TenantLandingSettings;
  openingHoursSummary: string | null;
  navItems: TenantNavItem[];
  year: number;
}

export async function LuxuryFooter({
  tenantName,
  settings,
  openingHoursSummary,
  navItems,
  year,
}: LuxuryFooterProps) {
  const t = await getTranslations('home');
  const platformOrigin = configuredSiteOrigin();

  return (
    <footer className="border-t border-white/10 py-10 text-sm text-white/65">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3 md:px-8">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">{tenantName}</p>
          {settings?.phone ? (
            <p>
              <a href={`tel:${settings.phone}`} className="hover:text-white">
                {settings.phone}
              </a>
            </p>
          ) : null}
          {settings?.address ? <p>{settings.address}</p> : null}
          {openingHoursSummary ? <p>{openingHoursSummary}</p> : null}
        </div>
        <nav aria-label={tenantName} className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em]">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <TenantBookButton
            size="sm"
            className="rounded-none text-[10px] uppercase tracking-[0.15em]"
          >
            {t('bookAppointment')}
          </TenantBookButton>
          <p>
            {t('poweredBy')}{' '}
            <a href={platformOrigin} className="text-white underline underline-offset-4">
              Barberly
            </a>
          </p>
        </div>
      </div>
      <p className="mt-8 text-center text-xs">
        © {year} {tenantName}
      </p>
    </footer>
  );
}
