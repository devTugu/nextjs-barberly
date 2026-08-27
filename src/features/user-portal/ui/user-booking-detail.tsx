'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useCancelPreview,
  usePublicBooking,
  useReschedulePreview,
} from '@/entities/booking';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageError, PageLoading } from '@/shared/ui/page-states';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { BookingStatusBadge } from './booking-status-badge';
import { UserBookingBalancePay } from './user-booking-balance-pay';
import {
  PolicyHint,
  usePolicyReasonLabel,
  useTenantPolicies,
} from './user-booking-shared';

export function UserBookingDetail({ bookingId }: { bookingId: number }) {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const policyReason = usePolicyReasonLabel();
  const policies = useTenantPolicies(tenant);
  const { data: booking, isLoading, isError } = usePublicBooking(tenant, bookingId);
  const { data: reschedulePreview } = useReschedulePreview(
    tenant,
    bookingId,
    booking?.status === 'confirmed',
  );
  const { data: cancelPreview } = useCancelPreview(
    tenant,
    bookingId,
    booking?.status === 'confirmed',
  );

  if (isLoading) return <PageLoading rows={3} />;
  if (isError || !booking) return <PageError />;

  const canManage = booking.status === 'confirmed';
  const remainingBalance = booking.remainingBalance ?? 0;
  const showPayBalance = canManage && remainingBalance > 0;
  const cancelPolicyLabel = policies
    ? t('cancelHoursPolicy', { hours: policies.cancelHoursBefore })
    : t('cancelPolicyHint');
  const reschedulePolicyLabel = policies
    ? t('rescheduleHoursPolicy', {
        hours:
          reschedulePreview?.rescheduleHoursBefore ??
          policies.rescheduleHoursBefore,
      })
    : t('cancelPolicyHint');

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('bookingTitle', { id: booking.id })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <BookingStatusBadge status={booking.status} />
            <p>{new Date(booking.startAtUtc).toLocaleString()}</p>
            <p>{booking.totalPrice.toLocaleString()}₮</p>
            {remainingBalance > 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('remainingBalance')}: {remainingBalance.toLocaleString()}₮
              </p>
            ) : null}
            <ul className="text-muted-foreground space-y-1 text-sm">
              {booking.services?.map((s) => (
                <li key={s.serviceId}>
                  {s.serviceName} · {s.durationMinutes}m · {s.price.toLocaleString()}₮
                </li>
              ))}
            </ul>
            {showPayBalance ? (
              <UserBookingBalancePay
                bookingId={booking.id}
                remainingBalance={remainingBalance}
                tenant={tenant}
              />
            ) : null}
            {canManage ? (
              <div className="grid gap-2 pt-2">
                <div className="flex items-center gap-1">
                  <Button
                    asChild
                    className="min-h-11 flex-1"
                    disabled={reschedulePreview?.allowed === false}
                  >
                    <Link href={ROUTES.userBookingReschedule(booking.id)}>
                      {t('reschedule')}
                    </Link>
                  </Button>
                  <PolicyHint label={reschedulePolicyLabel} />
                </div>
                {reschedulePreview?.allowed === false ? (
                  <p className="text-muted-foreground text-xs">
                    {policyReason(
                      reschedulePreview.reasonCode,
                      reschedulePreview.reason,
                    )}
                  </p>
                ) : null}
                <div className="flex items-center gap-1">
                  <Button
                    variant="destructive"
                    asChild
                    className="min-h-11 flex-1"
                    disabled={cancelPreview?.allowed === false}
                  >
                    <Link href={ROUTES.userBookingCancel(booking.id)}>
                      {t('cancel')}
                    </Link>
                  </Button>
                  <PolicyHint label={cancelPolicyLabel} />
                </div>
              </div>
            ) : null}
            <Button variant="link" onClick={() => router.push(ROUTES.USER_DASHBOARD)}>
              {t('back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
