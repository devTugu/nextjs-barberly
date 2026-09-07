'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { publicGet } from '@/shared/lib/public-api';
import { isPublicApiError } from '@/shared/lib/public-api-error';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageEmpty } from '@/shared/ui/page-states';
import { readBookingDraft, writeBookingDraft } from '../lib/booking-session';
import { matchesServiceQuery, type ServiceFilterId } from '../lib/service-filters';
import { sumServiceDuration, formatMnt } from '@/entities/booking';
import { BookingWizardShell } from './booking-wizard-shell';
import { SelectRow } from './select-row';
import { Button } from '@/shared/ui/button';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';

type Service = {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
};

const FILTERS: ServiceFilterId[] = ['all', 'haircut', 'shave', 'other'];

export function BookServicesStep() {
  const tenant = useTenantSubdomain();
  return <BookServicesStepInner key={tenant} tenant={tenant} />;
}

function BookServicesStepInner({ tenant }: { tenant: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const presetId = Number(searchParams.get('serviceId') ?? 0);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(
    draft.serviceIds.length ? draft.serviceIds : presetId ? [presetId] : [],
  );
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ServiceFilterId>('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    publicGet<Service[]>('/services', tenant)
      .then((next) => {
        if (!cancelled) setServices(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(isPublicApiError(err) ? err.message : t('errors.loadServices'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenant, t]);

  const visible = useMemo(
    () => services.filter((item) => matchesServiceQuery(item.name, query, filter)),
    [filter, query, services],
  );
  const totalDuration = useMemo(
    () => sumServiceDuration(services, selectedIds),
    [services, selectedIds],
  );

  const onContinue = () => {
    writeBookingDraft({
      serviceIds: selectedIds,
      serviceNames: services
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => item.name),
      totalDurationMinutes: totalDuration,
    });
    router.push(ROUTES.BOOK_STAFF);
  };

  const footer = (
    <Button
      disabled={!selectedIds.length || totalDuration === 0}
      onClick={onContinue}
      className={cn('min-h-12 w-full rounded-2xl text-base', brandPrimaryButtonClass)}
    >
      {t('continue')}
    </Button>
  );

  return (
    <BookingWizardShell
      title={t('title')}
      subtitle={t('servicesSubtitle')}
      footer={footer}
    >
      {error ? (
        <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <label className="mb-3 flex items-center gap-2 rounded-2xl bg-muted px-3 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchServices')}
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm',
              filter === id
                ? 'bg-[var(--brand-primary,#3b82f6)] text-white'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {id === 'all' ? t('filterAll') : t(
              id === 'haircut' ? 'filterHaircut' : id === 'shave' ? 'filterShave' : 'filterOther',
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <PageEmpty title={t('errors.loadServices')} />
      ) : (
        <div className="space-y-2">
          {visible.map((service) => {
            const selected = selectedIds.includes(service.id);
            return (
              <SelectRow
                key={service.id}
                selected={selected}
                onClick={() =>
                  setSelectedIds((ids) =>
                    ids.includes(service.id)
                      ? ids.filter((id) => id !== service.id)
                      : [...ids, service.id],
                  )
                }
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {service.durationMinutes}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.durationMinutes} {t('minutesShort')} · {formatMnt(service.price, locale)}
                  </p>
                </div>
              </SelectRow>
            );
          })}
        </div>
      )}
    </BookingWizardShell>
  );
}
