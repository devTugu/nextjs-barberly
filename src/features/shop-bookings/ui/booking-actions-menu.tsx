'use client';

import { Loader2, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  type BookingOutput,
  useCancelBooking,
  useCompleteBooking,
  useConfirmBooking,
  useNoShowBooking,
} from '@/entities/booking';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useShopTenant } from '@/shared/hooks/use-shop-tenant';
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
  const tenant = useShopTenant();
  const { can } = useAuthPermissions();
  const complete = useCompleteBooking(tenant);
  const cancel = useCancelBooking(tenant);
  const noShow = useNoShowBooking(tenant);
  const confirm = useConfirmBooking(tenant);

  const canUpdate = can(PERMISSION_CODES.BOOKING_UPDATE);
  if (!canUpdate) return null;

  const isPending =
    complete.isPending ||
    cancel.isPending ||
    noShow.isPending ||
    confirm.isPending;

  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const showComplete = booking.status === 'confirmed';
  const showNoShow = booking.status === 'confirmed';
  const showCancel = booking.status === 'confirmed';
  const showConfirm =
    booking.status === 'rescheduled' || booking.status === 'pending_payment';

  if (!showComplete && !showNoShow && !showCancel && !showConfirm) {
    return null;
  }

  return (
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
        {showConfirm ? (
          <DropdownMenuItem
            onClick={() =>
              runAction(
                () => confirm.mutateAsync(booking.id),
                t('toastConfirmed'),
              )
            }
          >
            {t('actionConfirm')}
          </DropdownMenuItem>
        ) : null}
        {showComplete ? (
          <DropdownMenuItem
            onClick={() =>
              runAction(
                () => complete.mutateAsync(booking.id),
                t('toastCompleted'),
              )
            }
          >
            {t('actionComplete')}
          </DropdownMenuItem>
        ) : null}
        {showNoShow ? (
          <DropdownMenuItem
            onClick={() =>
              runAction(
                () => noShow.mutateAsync(booking.id),
                t('toastNoShow'),
              )
            }
          >
            {t('actionNoShow')}
          </DropdownMenuItem>
        ) : null}
        {showCancel ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() =>
              runAction(
                () => cancel.mutateAsync(booking.id),
                t('toastCancelled'),
              )
            }
          >
            {t('actionCancel')}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
