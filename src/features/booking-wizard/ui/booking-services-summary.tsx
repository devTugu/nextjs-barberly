'use client';

import { useTranslations } from 'next-intl';

export interface BookingServiceSummaryItem {
  serviceId: number;
  serviceName: string;
  durationMinutes: number;
  price: number;
}

export function BookingServicesSummary({
  services,
  startAtUtc,
  totalPrice,
}: {
  services: BookingServiceSummaryItem[];
  startAtUtc?: string | null;
  totalPrice?: number;
}) {
  const t = useTranslations('bookingWizard');

  if (!services.length) return null;

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-sm font-medium">{t('pay.servicesSummary')}</p>
      {startAtUtc ? (
        <p className="text-muted-foreground text-sm">
          {new Date(startAtUtc).toLocaleString()}
        </p>
      ) : null}
      <ul className="text-muted-foreground space-y-1 text-sm">
        {services.map((service) => (
          <li key={service.serviceId}>
            {service.serviceName} · {service.durationMinutes}m ·{' '}
            {service.price.toLocaleString()}₮
          </li>
        ))}
      </ul>
      {totalPrice != null ? (
        <p className="text-sm font-medium">
          {t('summaryPrice', { price: `${totalPrice.toLocaleString()}₮` })}
        </p>
      ) : null}
    </div>
  );
}
