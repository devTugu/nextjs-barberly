'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { publicGet } from '@/shared/lib/public-api';
import { isPublicApiError } from '@/shared/lib/public-api-error';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageEmpty } from '@/shared/ui/page-states';
import { readBookingDraft, writeBookingDraft } from '../lib/booking-session';
import { sumServiceDuration, sumServicePrice } from '@/entities/booking';
import { formatMnt } from '@/entities/booking';
import { BookingWizardShell } from './booking-wizard-shell';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';

type Service = {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
};

export function BookServicesStep() {
  const tenant = useTenantSubdomain();
  return <BookServicesStepInner key={tenant} tenant={tenant} />;
}

function BookServicesStepInner({ tenant }: { tenant: string }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(draft.serviceIds);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    publicGet<Service[]>('/services', tenant)
      .then((next) => {
        if (!cancelled) setServices(next);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(isPublicApiError(e) ? e.message : t('errors.loadServices'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant, t]);

  const totalDuration = useMemo(
    () => sumServiceDuration(services, selectedIds),
    [services, selectedIds],
  );
  const totalPrice = useMemo(
    () => sumServicePrice(services, selectedIds),
    [services, selectedIds],
  );

  const toggleService = (serviceId: number) => {
    setSelectedIds((ids) =>
      ids.includes(serviceId)
        ? ids.filter((id) => id !== serviceId)
        : [...ids, serviceId],
    );
  };

  const onContinue = () => {
    writeBookingDraft({
      serviceIds: selectedIds,
      totalDurationMinutes: totalDuration,
    });
    router.push(ROUTES.BOOK_STAFF);
  };

  const footer = (
    <div className="space-y-3">
      {totalDuration > 0 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('summaryDuration', { minutes: totalDuration })}</span>
          <span className="font-semibold">{formatMnt(totalPrice, locale)}</span>
        </div>
      ) : null}
      <Button
        disabled={!selectedIds.length || totalDuration === 0}
        onClick={onContinue}
        className={cn('min-h-12 w-full rounded-xl text-base', brandPrimaryButtonClass)}
      >
        {t('nextStaff')}
      </Button>
    </div>
  );

  return (
    <BookingWizardShell step={1} title={t('servicesTitle')} footer={footer}>
      {error ? (
        <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {t('stepService')}
      </p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <PageEmpty title={t('errors.loadServices')} />
      ) : (
        <div className="space-y-2">
          {services.map((service) => {
            const selected = selectedIds.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
                  selected
                    ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)]/10'
                    : 'border-border/60 bg-card',
                )}
              >
                <div
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border',
                    selected
                      ? 'border-[var(--brand-primary,#f97316)] bg-[var(--brand-primary,#f97316)] text-white'
                      : 'border-muted-foreground/40',
                  )}
                >
                  {selected ? <Check className="size-3.5" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.durationMinutes} {t('minutesShort')} · {formatMnt(service.price, locale)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </BookingWizardShell>
  );
}
