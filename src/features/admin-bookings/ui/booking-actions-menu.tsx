'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  type BookingOutput,
  useCancelBooking,
  useCompleteBooking,
  useConfirmBooking,
  useNoShowBooking,
  useOfflineSettlement,
  useReopenSettlement,
} from '@/entities/booking';
import { useAuthPermissions } from '@/entities/session';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';
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
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface BookingActionsMenuProps {
  booking: BookingOutput;
}

export function BookingActionsMenu({ booking }: BookingActionsMenuProps) {
  const t = useTranslations('entities.bookings');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const { can, isOwner } = useAuthPermissions();
  const complete = useCompleteBooking(tenant);
  const cancel = useCancelBooking(tenant);
  const noShow = useNoShowBooking(tenant);
  const confirm = useConfirmBooking(tenant);
  const offlineSettlement = useOfflineSettlement(tenant);
  const reopen = useReopenSettlement(tenant);

  const canUpdate = can(PERMISSION_CODES.BOOKING_UPDATE);
  const canRead = can(PERMISSION_CODES.BOOKING_READ);

  const isFullySettled = booking.paymentSettlementStatus === 'fully_settled';
  const canSettleOffline =
    booking.status === 'confirmed' && booking.remainingBalance > 0;
  const canReopen =
    isOwner &&
    booking.status === 'completed' &&
    booking.balanceRecordedOfflineAmount > 0;

  const isPending =
    complete.isPending ||
    cancel.isPending ||
    noShow.isPending ||
    confirm.isPending ||
    offlineSettlement.isPending ||
    reopen.isPending;

  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> => {
    try {
      await action();
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  const showComplete = booking.status === 'confirmed';
  const showNoShow = booking.status === 'confirmed';
  const showCancel = booking.status === 'confirmed';
  const showConfirm =
    booking.status === 'rescheduled' || booking.status === 'pending_payment';
  const showOfflineSettlement = canSettleOffline;

  if (!canRead) return null;

  const hasStatusActions =
    canUpdate &&
    (showComplete ||
      showNoShow ||
      showCancel ||
      showConfirm ||
      showOfflineSettlement ||
      canReopen);

  if (!hasStatusActions) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href={ROUTES.adminBooking(booking.id)}>{t('viewDetail')}</Link>
      </Button>
    );
  }

  const handleCancel = async () => {
    const ok = await runAction(
      () => cancel.mutateAsync(booking.id),
      t('toastCancelled'),
    );
    if (ok) setCancelOpen(false);
  };

  const handleComplete = async () => {
    const ok = await runAction(
      () => complete.mutateAsync(booking.id),
      t('toastCompleted'),
    );
    if (ok) setCompleteOpen(false);
  };

  const handleNoShow = async () => {
    const ok = await runAction(
      () => noShow.mutateAsync(booking.id),
      t('toastNoShow'),
    );
    if (ok) setNoShowOpen(false);
  };

  const handleReopen = async () => {
    const ok = await runAction(
      () => reopen.mutateAsync(booking.id),
      t('toastReopened'),
    );
    if (ok) setReopenOpen(false);
  };

  const completeLabel = isFullySettled
    ? t('actionComplete')
    : t('actionCompleteNeedsSettlement');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isPending}
            aria-label={tCommon('actions')}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MoreHorizontal className="size-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.adminBooking(booking.id)}>{t('viewDetail')}</Link>
          </DropdownMenuItem>
          {showConfirm ? (
            <DropdownMenuItem
              onClick={() =>
                void runAction(
                  () => confirm.mutateAsync(booking.id),
                  t('toastConfirmed'),
                )
              }
            >
              {t('actionConfirm')}
            </DropdownMenuItem>
          ) : null}
          {showOfflineSettlement ? (
            <>
              <DropdownMenuItem
                onClick={() =>
                  void runAction(
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
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  void runAction(
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
              </DropdownMenuItem>
            </>
          ) : null}
          {showComplete ? (
            <DropdownMenuItem
              disabled={!isFullySettled}
              onClick={() => isFullySettled && setCompleteOpen(true)}
            >
              {completeLabel}
            </DropdownMenuItem>
          ) : null}
          {canReopen ? (
            <DropdownMenuItem onClick={() => setReopenOpen(true)}>
              {t('actionReopenSettlement')}
            </DropdownMenuItem>
          ) : null}
          {showNoShow ? (
            <DropdownMenuItem onClick={() => setNoShowOpen(true)}>
              {t('actionNoShow')}
            </DropdownMenuItem>
          ) : null}
          {showCancel ? (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              {t('actionCancel')}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
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
            <AlertDialogCancel disabled={complete.isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={complete.isPending || !isFullySettled}
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
      <AlertDialog open={reopenOpen} onOpenChange={setReopenOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reopenConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reopenConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reopen.isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={reopen.isPending}
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
      <AlertDialog open={noShowOpen} onOpenChange={setNoShowOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('noShowConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('noShowConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={noShow.isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={noShow.isPending}
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
            <AlertDialogCancel disabled={cancel.isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancel.isPending}
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
    </>
  );
}
