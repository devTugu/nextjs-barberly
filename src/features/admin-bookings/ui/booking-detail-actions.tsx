'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

interface BookingDetailActionsProps {
  bookingId: number;
}

export function BookingDetailActions({ bookingId }: BookingDetailActionsProps) {
  const t = useTranslations('entities.bookings');
  const tCommon = useTranslations('common');
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

  const run = async (
    action: () => Promise<unknown>,
    message: string,
  ): Promise<boolean> => {
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
  const customerName = booking.customerName ?? t('unknownCustomer');
  const customerPhone = booking.customerPhone ?? t('unknownPhone');
  const completeLabel = isFullySettled
    ? t('actionComplete')
    : t('actionCompleteNeedsSettlement');

  const handleCancel = async () => {
    const ok = await run(
      () => cancel.mutateAsync(booking.id),
      t('toastCancelled'),
    );
    if (ok) setCancelOpen(false);
  };

  const handleComplete = async () => {
    const ok = await run(
      () => complete.mutateAsync(booking.id),
      t('toastCompleted'),
    );
    if (ok) setCompleteOpen(false);
  };

  const handleNoShow = async () => {
    const ok = await run(
      () => noShow.mutateAsync(booking.id),
      t('toastNoShow'),
    );
    if (ok) setNoShowOpen(false);
  };

  const handleReopen = async () => {
    const ok = await run(
      () => reopen.mutateAsync(booking.id),
      t('toastReopened'),
    );
    if (ok) setReopenOpen(false);
  };

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
        <p className="text-muted-foreground text-sm">
          {new Date(booking.startAtUtc).toLocaleString()} ·{' '}
          {booking.totalPrice.toLocaleString()}₮
        </p>
        {showPaymentStatus ? (
          <div className="rounded-md border p-3 text-sm space-y-2">
            <p className="text-muted-foreground">{t('paymentStatusTitle')}</p>
            <p className="font-medium">
              {t(`settlementStatus.${booking.paymentSettlementStatus}`)}
            </p>
            <div className="text-muted-foreground space-y-1">
              <p>
                {t('depositAmount')}: {booking.depositAmount.toLocaleString()}₮
              </p>
              <p>
                {t('balanceDue')}: {booking.balanceDue.toLocaleString()}₮
              </p>
              <p>
                {t('remainingBalance')}:{' '}
                {booking.remainingBalance.toLocaleString()}₮
              </p>
            </div>
            {booking.status === 'pending_payment' && lockExpiresLabel ? (
              <p className="text-muted-foreground mt-1">
                {lockExpired
                  ? t('lockExpired')
                  : t('lockExpiresAt', { time: lockExpiresLabel })}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="grid gap-3 rounded-md border p-3 text-sm">
          <div>
            <p className="text-muted-foreground">{t('customer')}</p>
            <p className="font-medium">{customerName}</p>
            <p className="text-muted-foreground">{customerPhone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('services')}</p>
            <div className="mt-2 space-y-2">
              {booking.services.map((service) => (
                <div
                  key={service.serviceId}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{service.serviceName}</span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {service.durationMinutes} min ·{' '}
                    {service.price.toLocaleString()}₮
                  </span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-2">
              {t('summary', {
                duration: totalDuration,
                price: booking.totalPrice.toLocaleString(),
              })}
            </p>
          </div>
        </div>
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
              {completeLabel}
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
            <AlertDialog open={completeOpen} onOpenChange={setCompleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('completeConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isFullySettled
                      ? t('completeConfirmDescription')
                      : t('completeRequiresSettlement')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    {tCommon('cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isPending || !isFullySettled}
                    onClick={handleComplete}
                  >
                    {complete.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {t('actionComplete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={noShowOpen} onOpenChange={setNoShowOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('noShowConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('noShowConfirmDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    {tCommon('cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isPending}
                    onClick={handleNoShow}
                  >
                    {noShow.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {t('actionNoShow')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('cancelConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('cancelFullRefundHint')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    {tCommon('cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isPending}
                    onClick={handleCancel}
                  >
                    {cancel.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {t('actionCancel')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
            <AlertDialog open={reopenOpen} onOpenChange={setReopenOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('reopenConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('reopenConfirmDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>
                    {tCommon('cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isPending}
                    onClick={handleReopen}
                  >
                    {reopen.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {t('actionReopenSettlement')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
