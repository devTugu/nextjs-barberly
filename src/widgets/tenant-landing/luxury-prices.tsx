import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { TenantLandingService } from './tenant-landing-types';

interface LuxuryPricesProps {
  tenantName: string;
  services: TenantLandingService[];
  pricingImageUrl?: string | null;
}

export async function LuxuryPrices({
  tenantName,
  services,
  pricingImageUrl,
}: LuxuryPricesProps) {
  const t = await getTranslations('home');
  const priceServices = services.slice(0, 6);
  if (priceServices.length === 0) return null;

  return (
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
          {pricingImageUrl ? (
            <Image
              src={pricingImageUrl}
              alt={`${tenantName} services`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
