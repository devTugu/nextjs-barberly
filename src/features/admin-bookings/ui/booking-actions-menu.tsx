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
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { BookingConfirmDialog } from './booking-confirm-dialog';

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
        onConfirm={() => void handleComplete()}
      />
      <BookingConfirmDialog
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        title={t('reopenConfirmTitle')}
        description={t('reopenConfirmDescription')}
        confirmLabel={t('actionReopenSettlement')}
        pending={reopen.isPending}
        onConfirm={() => void handleReopen()}
      />
      <BookingConfirmDialog
        open={noShowOpen}
        onOpenChange={setNoShowOpen}
        title={t('noShowConfirmTitle')}
        description={t('noShowConfirmDescription')}
        confirmLabel={t('actionNoShow')}
        pending={noShow.isPending}
        onConfirm={() => void handleNoShow()}
      />
      <BookingConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t('cancelConfirmTitle')}
        description={t('cancelFullRefundHint')}
        confirmLabel={t('actionCancel')}
        pending={cancel.isPending}
        destructive
        onConfirm={() => void handleCancel()}
      />
    </>
  );
}
