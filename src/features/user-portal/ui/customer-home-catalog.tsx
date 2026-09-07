'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { formatMnt, getInitials, staffRatingPlaceholder } from '@/entities/booking';

interface CatalogService {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

interface CatalogStaff {
  id: number;
  displayName: string;
}

interface CustomerHomeCatalogProps {
  services: CatalogService[];
  staff: CatalogStaff[];
}

export function CustomerHomeCatalog({ services, staff }: CustomerHomeCatalogProps) {
  const t = useTranslations('customerShell');
  const tWizard = useTranslations('bookingWizard');
  const locale = useLocale();
  const popular = services.slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-base font-semibold">{t('popularServices')}</h2>
          <Link href={ROUTES.BOOK} className="text-xs text-[var(--brand-primary,#3b82f6)]">
            {t('services')}
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {popular.map((service) => (
            <Link
              key={service.id}
              href={`${ROUTES.BOOK}?serviceId=${service.id}`}
              className="min-w-[11.5rem] shrink-0 overflow-hidden rounded-3xl bg-white/5 text-left"
            >
              <div className="h-24 bg-gradient-to-br from-blue-500/40 to-slate-800" />
              <div className="space-y-1 p-3">
                <p className="truncate text-sm font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {service.durationMinutes} {tWizard('minutesShort')}
                </p>
                <p className="text-sm font-semibold text-[var(--brand-primary,#3b82f6)]">
                  {formatMnt(service.price, locale)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="barbers" className="scroll-mt-20 space-y-3">
        <h2 className="px-4 text-base font-semibold">{t('ourBarbers')}</h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {staff.map((member) => (
            <Link
              key={member.id}
              href={ROUTES.BOOK}
              className="min-w-[9.5rem] shrink-0 rounded-3xl bg-white/5 p-3"
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-500/20 text-lg font-semibold">
                {getInitials(member.displayName)}
              </div>
              <p className="mt-3 truncate text-sm font-semibold">{member.displayName}</p>
              <p className="text-xs text-muted-foreground">{tWizard('staffRole')}</p>
              <p className="mt-1 flex items-center gap-1 text-xs">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {staffRatingPlaceholder(member.id)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
