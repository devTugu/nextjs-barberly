'use client';

import { useState, type ReactNode } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTenant } from '@/entities/tenant';
import {
  useApproveWithdrawal,
  useRejectWithdrawal,
  useWithdrawal,
} from '@/entities/withdrawal';
import { getErrorMessage } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';
import { getDateLocale } from '@/shared/i18n/messages';
import type { Locale } from '@/shared/i18n/config';
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
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { PageError, PageLoading } from '@/shared/ui/page-states';

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' {
  if (status === 'approved') return 'default';
  if (status === 'rejected') return 'destructive';
  return 'secondary';
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function TimelineStep({
  title,
  description,
  active,
  complete,
}: {
  title: string;
  description: string;
  active?: boolean;
  complete?: boolean;
}) {
  const Icon = complete ? CheckCircle2 : Circle;

  return (
    <div className="flex gap-3">
      <Icon
        className={
          complete
            ? 'text-primary mt-0.5 size-4 shrink-0'
            : active
              ? 'text-muted-foreground mt-0.5 size-4 shrink-0 animate-pulse'
              : 'text-muted-foreground/50 mt-0.5 size-4 shrink-0'
        }
        aria-hidden
      />
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  );
}

export function WithdrawalDetail({ id }: { id: number }) {
  const router = useRouter();
  const t = useTranslations('withdrawals');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const dateLocale = getDateLocale(locale);
  const { data, isLoading, isError, error, refetch } = useWithdrawal(id);
  const { data: tenant } = useTenant(data?.tenantId ?? 0, Boolean(data?.tenantId));
  const approve = useApproveWithdrawal();
  const reject = useRejectWithdrawal();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(dateLocale);

  if (isLoading) return <PageLoading rows={4} />;
  if (isError) {
    return <PageError error={error ?? undefined} reset={() => void refetch()} />;
  }
  if (!data) {
    return <PageError error={new Error(tCommon('notFound'))} />;
  }

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(id);
      toast.success(t('approved'));
      router.push(ROUTES.PLATFORM_WITHDRAWALS);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync({
        id,
        reason: rejectReason.trim() || undefined,
      });
      toast.success(t('rejected'));
      setRejectOpen(false);
      setRejectReason('');
      router.push(ROUTES.PLATFORM_WITHDRAWALS);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const reviewedLabel =
    data.status === 'approved'
      ? tStatus('approved')
      : data.status === 'rejected'
        ? tStatus('rejected')
        : t('timelinePendingReview');

  return (
    <>
      <div className="mx-auto grid max-w-lg gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('detailTitle', { id: data.id })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow
              label={t('tenant')}
              value={tenant?.name ?? `#${data.tenantId}`}
            />
            <DetailRow
              label={t('amount')}
              value={`${data.amount.toLocaleString()}₮`}
            />
            <DetailRow
              label={t('status')}
              value={
                <Badge variant={statusVariant(data.status)}>
                  {tStatus(data.status)}
                </Badge>
              }
            />
            <DetailRow
              label={t('reference')}
              value={data.reference ?? '—'}
            />
            <DetailRow
              label={t('walletTransaction')}
              value={`#${data.walletTransactionId}`}
            />
            <DetailRow
              label={t('createdAt')}
              value={formatDate(data.createdAt)}
            />
            {data.reviewedAt ? (
              <DetailRow
                label={t('reviewedAt')}
                value={formatDate(data.reviewedAt)}
              />
            ) : null}
            {data.reviewedByEmail ? (
              <DetailRow label={t('reviewedBy')} value={data.reviewedByEmail} />
            ) : null}
            {data.rejectReason ? (
              <DetailRow label={t('rejectReason')} value={data.rejectReason} />
            ) : null}
            {data.status === 'pending' ? (
              <div className="grid gap-2 pt-2">
                <Button
                  size="lg"
                  className="min-h-11"
                  disabled={approve.isPending}
                  onClick={() => void handleApprove()}
                >
                  {approve.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {t('approve')}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="min-h-11"
                  disabled={reject.isPending}
                  onClick={() => setRejectOpen(true)}
                >
                  {t('reject')}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('timelineTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TimelineStep
              title={t('timelineCreated')}
              description={formatDate(data.createdAt)}
              complete
            />
            <TimelineStep
              title={t('timelineReviewed')}
              description={
                data.reviewedAt
                  ? `${reviewedLabel}${data.reviewedByEmail ? ` · ${data.reviewedByEmail}` : ''} · ${formatDate(data.reviewedAt)}`
                  : t('timelinePendingReview')
              }
              active={data.status === 'pending'}
              complete={data.status !== 'pending'}
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setRejectReason('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reject')}</AlertDialogTitle>
            <AlertDialogDescription>{t('rejectConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">{t('rejectReason')}</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder={t('rejectReasonPlaceholder')}
              rows={3}
              maxLength={500}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reject.isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleReject()}
              disabled={reject.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {reject.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {t('reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
