'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCancelPreview, usePublicBooking } from '@/entities/booking';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageLoading } from '@/shared/ui/page-states';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { usePolicyReasonLabel } from './user-booking-shared';

export function UserBookingCancel({ bookingId }: { bookingId: number }) {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();
  const router = useRouter();
  const policyReason = usePolicyReasonLabel();
  const { data: booking, isLoading: bookingLoading } = usePublicBooking(
    tenant,
    bookingId,
  );
  const { data: preview, isLoading: previewLoading } = useCancelPreview(
    tenant,
    bookingId,
  );
  const [pending, setPending] = useState(false);

  const cancel = async () => {
    setPending(true);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(
        `/api/public/bookings/${bookingId}/cancel?tenant=${tenant}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { ...(await csrf) },
        },
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? t('cancelFailed'));
      }
      const refund = body.data?.refundPercent as number | undefined;
      toast.success(
        refund != null
          ? t('cancelSuccess', { percent: refund })
          : t('confirmCancel'),
      );
      router.push(ROUTES.USER_DASHBOARD);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('cancelFailed'));
    } finally {
      setPending(false);
    }
  };

  if (bookingLoading || previewLoading) return <PageLoading rows={3} />;

  const refundLabel = preview?.allowed
    ? t('refundPreview', {
        percent: preview.refundPercent,
        amount: `${preview.refundAmount.toLocaleString()}₮`,
      })
    : policyReason(preview?.reasonCode, preview?.reason);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('cancelTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {booking ? (
            <p className="text-sm">
              {new Date(booking.startAtUtc).toLocaleString()} ·{' '}
              {booking.totalPrice.toLocaleString()}₮
            </p>
          ) : null}
          <p className="text-muted-foreground text-sm">{t('cancelPolicyHint')}</p>
          {preview ? (
            <Alert>
              <AlertDescription>{refundLabel}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="min-h-11 w-full"
                disabled={preview?.allowed === false || pending}
              >
                {t('confirmCancel')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('cancelTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {preview?.allowed
                    ? t('refundPreview', {
                        percent: preview.refundPercent,
                        amount: `${preview.refundAmount.toLocaleString()}₮`,
                      })
                    : t('cancelPolicyHint')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('back')}</AlertDialogCancel>
                <AlertDialogAction onClick={cancel}>
                  {t('confirmCancel')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
