'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useBooking,
  useCancelBooking,
  useCompleteBooking,
  useNoShowBooking,
  useOfflineSettlement,
  useReopenSettlement,
} from '@/entities/booking';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { BookingConfirmDialog } from './booking-confirm-dialog';
import { BookingDetailSummary } from './booking-detail-summary';

interface BookingDetailActionsProps {
  bookingId: number;
}

export function BookingDetailActions({ bookingId }: BookingDetailActionsProps) {
  const t = useTranslations('entities.bookings');
  const tenant = useTenantSubdomain();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const { can, isOwner } = useAuthPermissions();
  const { data: booking, isLoading } = useBooking(tenant, bookingId);
  const complete = useCompleteBooking(tenant);
  const cancel = useCancelBooking(tenant);
  const noShow = useNoShowBooking(tenant);
  const offlineSettlement = useOfflineSettlement(tenant);
  const reopen = useReopenSettlement(tenant);
  const canUpdate = can(PERMISSION_CODES.BOOKING_UPDATE);
  const isPending =
    complete.isPending ||
    cancel.isPending ||
    noShow.isPending ||
    offlineSettlement.isPending ||
    reopen.isPending;

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!booking) return <p>{t('notFound')}</p>;

  const showActions = booking.status === 'confirmed' && canUpdate;
  const isFullySettled = booking.paymentSettlementStatus === 'fully_settled';
  const canSettleOffline = booking.remainingBalance > 0;
  const canReopen =
    isOwner &&
    canUpdate &&
    booking.status === 'completed' &&
    booking.balanceRecordedOfflineAmount > 0;
  const showPaymentStatus =
    booking.status === 'pending_payment' ||
    booking.status === 'confirmed' ||
    booking.status === 'completed';
  const totalDuration = booking.services.reduce(
    (sum, service) => sum + service.durationMinutes,
    0,
  );
  const lockExpiresLabel = booking.lockExpiresAt
    ? new Date(booking.lockExpiresAt).toLocaleString()
    : null;
  const lockExpired =
    booking.status === 'pending_payment' &&
    booking.lockExpiresAt !== null &&
    new Date(booking.lockExpiresAt).getTime() <= Date.now();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>#{booking.id}</span>
          <Badge variant="secondary">{t(`status.${booking.status}`)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <BookingDetailSummary
            booking={booking}
            customerName={booking.customerName ?? t('unknownCustomer')}
            customerPhone={booking.customerPhone ?? t('unknownPhone')}
            totalDuration={totalDuration}
            lockExpiresLabel={lockExpiresLabel}
            lockExpired={lockExpired}
            showPaymentStatus={showPaymentStatus}
            labels={{
              paymentStatusTitle: t('paymentStatusTitle'),
              settlementStatus: t(
                `settlementStatus.${booking.paymentSettlementStatus}`,
              ),
              depositAmount: t('depositAmount'),
              balanceDue: t('balanceDue'),
              remainingBalance: t('remainingBalance'),
              lockExpired: t('lockExpired'),
              lockExpiresAt: t('lockExpiresAt', { time: lockExpiresLabel ?? '' }),
              customer: t('customer'),
              services: t('services'),
              summary: t('summary', {
                duration: totalDuration,
                price: booking.totalPrice.toLocaleString(),
              }),
            }}
          />
        {showActions ? (
          <div className="grid gap-3">
            {canSettleOffline ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 text-base"
                  disabled={isPending}
                  onClick={() =>
                    void run(
                      () =>
                        offlineSettlement.mutateAsync({
                          id: booking.id,
                          method: 'cash',
                        }),
                      t('toastOfflineSettled'),
                    )
                  }
                >
                  {t('actionSettleCash')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 text-base"
                  disabled={isPending}
                  onClick={() =>
                    void run(
                      () =>
                        offlineSettlement.mutateAsync({
                          id: booking.id,
                          method: 'card',
                        }),
                      t('toastOfflineSettled'),
                    )
                  }
                >
                  {t('actionSettleCard')}
                </Button>
              </div>
            ) : null}
            <Button
              size="lg"
              className="h-14 text-base"
              disabled={isPending || !isFullySettled}
              onClick={() => setCompleteOpen(true)}
            >
              {isFullySettled
                ? t('actionComplete')
                : t('actionCompleteNeedsSettlement')}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-14 text-base"
              disabled={isPending}
              onClick={() => setNoShowOpen(true)}
            >
              {t('actionNoShow')}
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="h-14 text-base"
              disabled={isPending}
              onClick={() => setCancelOpen(true)}
            >
              {t('actionCancel')}
            </Button>
            <BookingConfirmDialog
              open={completeOpen}
              onOpenChange={setCompleteOpen}
              title={t('completeConfirmTitle')}
              description={
                isFullySettled
                  ? t('completeConfirmDescription')
                  : t('completeRequiresSettlement')
              }
              confirmLabel={t('actionComplete')}
              pending={complete.isPending}
              disabled={!isFullySettled}
              onConfirm={() =>
                void run(() => complete.mutateAsync(booking.id), t('toastCompleted')).then(
                  (ok) => ok && setCompleteOpen(false),
                )
              }
            />
            <BookingConfirmDialog
              open={noShowOpen}
              onOpenChange={setNoShowOpen}
              title={t('noShowConfirmTitle')}
              description={t('noShowConfirmDescription')}
              confirmLabel={t('actionNoShow')}
              pending={noShow.isPending}
              onConfirm={() =>
                void run(() => noShow.mutateAsync(booking.id), t('toastNoShow')).then(
                  (ok) => ok && setNoShowOpen(false),
                )
              }
            />
            <BookingConfirmDialog
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              title={t('cancelConfirmTitle')}
              description={t('cancelFullRefundHint')}
              confirmLabel={t('actionCancel')}
              pending={cancel.isPending}
              destructive
              onConfirm={() =>
                void run(() => cancel.mutateAsync(booking.id), t('toastCancelled')).then(
                  (ok) => ok && setCancelOpen(false),
                )
              }
            />
          </div>
        ) : null}
        {canReopen ? (
          <div className="grid gap-3">
            <Button
              size="lg"
              variant="outline"
              className="h-14 text-base"
              disabled={isPending}
              onClick={() => setReopenOpen(true)}
            >
              {t('actionReopenSettlement')}
            </Button>
            <BookingConfirmDialog
              open={reopenOpen}
              onOpenChange={setReopenOpen}
              title={t('reopenConfirmTitle')}
              description={t('reopenConfirmDescription')}
              confirmLabel={t('actionReopenSettlement')}
              pending={reopen.isPending}
              onConfirm={() =>
                void run(() => reopen.mutateAsync(booking.id), t('toastReopened')).then(
                  (ok) => ok && setReopenOpen(false),
                )
              }
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
