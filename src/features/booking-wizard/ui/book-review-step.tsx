'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Star } from 'lucide-react';
import { isPublicApiError } from '@/shared/lib/public-api-error';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { formatMnt, getInitials, formatBookingDateTime } from '@/entities/booking';
import { publicGet } from '@/shared/lib/public-api';
import { readBookingDraft } from '../lib/booking-session';
import { lockDraftSlot } from '../lib/lock-booking';
import { BookingWizardShell } from './booking-wizard-shell';
import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

type Service = { id: number; name: string; price: number };

export function BookReviewStep() {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const locale = useLocale();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    if (!draft.serviceIds.length || !draft.selectedSlot) {
      router.replace(ROUTES.BOOK_SLOT);
      return;
    }
    publicGet<Service[]>('/services', tenant)
      .then(setServices)
      .catch(() => undefined);
  }, [draft.selectedSlot, draft.serviceIds.length, router, tenant]);

  const selectedServices = services.filter((item) =>
    draft.serviceIds.includes(item.id),
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, item) => sum + item.price, 0),
    [selectedServices],
  );

  const onPay = async () => {
    setLocking(true);
    setError(null);
    try {
      const result = await lockDraftSlot(tenant);
      router.push(result.needsAuth ? ROUTES.BOOK_OTP : ROUTES.BOOK_PAY);
    } catch (err) {
      setError(
        isPublicApiError(err) && err.code === 'CONFLICT'
          ? t('errors.slotTaken')
          : err instanceof Error
            ? err.message
            : t('errors.lockFailed'),
      );
    } finally {
      setLocking(false);
    }
  };

  return (
    <BookingWizardShell
      title={t('reviewTitle')}
      backHref={ROUTES.BOOK_SLOT}
      footer={
        <Button
          disabled={locking || !draft.selectedSlot}
          onClick={() => void onPay()}
          className={cn('min-h-12 w-full rounded-2xl text-base', brandPrimaryButtonClass)}
        >
          {locking ? <Loader2 className="size-5 animate-spin" /> : t('payCta')}
        </Button>
      }
    >
      {error ? (
        <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3 rounded-2xl border p-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-base font-semibold text-[var(--brand-primary,#3b82f6)]">
          {getInitials(draft.staffName || 'B')}
        </div>
        <div>
          <p className="font-semibold">{draft.staffName || t('anyStaff')}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            {t('staffRole')}
            <Star className="size-3 fill-amber-400 text-amber-400" />
            4.9
          </p>
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        {selectedServices.map((service) => (
          <div key={service.id} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{service.name}</dt>
            <dd className="font-medium">{formatMnt(service.price, locale)}</dd>
          </div>
        ))}
        {draft.selectedSlot ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t('pickDateTime')}</dt>
            <dd className="font-medium">
              {formatBookingDateTime(
                draft.selectedSlot.startAtUtc,
                locale,
                draft.timezone,
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">{t('pay.totalLabel')}</span>
        <span className="text-xl font-semibold">{formatMnt(totalPrice, locale)}</span>
      </div>
    </BookingWizardShell>
  );
}
