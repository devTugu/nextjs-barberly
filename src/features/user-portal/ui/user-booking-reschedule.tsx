'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  bookingServicesDuration,
  SlotPicker,
  usePublicBooking,
  useReschedulePreview,
  type SlotSelection,
} from '@/entities/booking';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageError, PageLoading } from '@/shared/ui/page-states';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { usePolicyReasonLabel } from './user-booking-shared';

export function UserBookingReschedule({ bookingId }: { bookingId: number }) {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const policyReason = usePolicyReasonLabel();
  const { data: booking, isLoading } = usePublicBooking(tenant, bookingId);
  const { data: preview } = useReschedulePreview(tenant, bookingId);
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<SlotSelection | null>(null);
  const [pending, setPending] = useState(false);

  const duration = useMemo(
    () => (booking ? bookingServicesDuration(booking.services ?? []) : 60),
    [booking],
  );
  const serviceIds = useMemo(
    () => booking?.services?.map((s) => s.serviceId) ?? [],
    [booking],
  );

  const reschedule = async () => {
    if (!selectedSlot) return;
    setPending(true);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(
        `/api/public/bookings/${bookingId}/reschedule?tenant=${tenant}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...(await csrf) },
          body: JSON.stringify({
            newStartAtUtc: selectedSlot.startAtUtc,
            durationMinutes: duration,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? t('rescheduleFailed'));
      }
      toast.success(t('rescheduleTitle'));
      router.push(ROUTES.userBooking(bookingId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('rescheduleFailed'));
    } finally {
      setPending(false);
    }
  };

  if (isLoading || !booking) return <PageLoading rows={4} />;
  if (preview && !preview.allowed) {
    return (
      <PageError
        error={
          new Error(
            policyReason(preview.reasonCode, preview.reason),
          )
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-xl font-semibold">{t('rescheduleTitle')}</h1>
      <div className="space-y-2">
        <Label htmlFor="reschedule-date">{t('pickDate')}</Label>
        <Input
          id="reschedule-date"
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {date ? (
        <SlotPicker
          tenant={tenant}
          date={date}
          durationMinutes={duration}
          serviceIds={serviceIds}
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
        />
      ) : null}
      <Button
        className="min-h-11 w-full"
        disabled={!selectedSlot || pending}
        onClick={reschedule}
      >
        {t('reschedule')}
      </Button>
    </div>
  );
}
