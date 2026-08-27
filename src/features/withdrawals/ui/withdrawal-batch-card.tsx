'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useApproveWithdrawalBatch,
  useRejectWithdrawalBatch,
  type WithdrawalBatch,
} from '@/entities/withdrawal';
import { getErrorMessage } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';
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
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { withdrawalStatusVariant } from './withdrawal-status';

export function WithdrawalBatchCard({
  batch,
  tenantNames,
}: {
  batch: WithdrawalBatch;
  tenantNames: Map<number, string>;
}) {
  const t = useTranslations('withdrawals');
  const tStatus = useTranslations('status');
  const tEntities = useTranslations('entities.withdrawals');
  const tCommon = useTranslations('common');
  const [expanded, setExpanded] = useState(batch.status === 'pending');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const approve = useApproveWithdrawalBatch();
  const reject = useRejectWithdrawalBatch();
  const brandName =
    tenantNames.get(batch.brandRootId) ?? `#${batch.brandRootId}`;

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(batch.id);
      toast.success(t('batchApproved'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync({
        id: batch.id,
        reason: rejectReason.trim() || undefined,
      });
      toast.success(t('batchRejected'));
      setRejectOpen(false);
      setRejectReason('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </Button>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{t('batchTitle', { id: batch.id })}</p>
            <Badge variant={withdrawalStatusVariant(batch.status)}>
              {tStatus(batch.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {brandName} · {batch.branchCount} {t('branches')} ·{' '}
            {batch.totalAmount.toLocaleString()}₮ ·{' '}
            {new Date(batch.createdAt).toLocaleString()}
          </p>
        </div>
        {batch.status === 'pending' ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={approve.isPending}
              onClick={() => void handleApprove()}
            >
              {approve.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {t('approve')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={reject.isPending}
              onClick={() => setRejectOpen(true)}
            >
              {t('reject')}
            </Button>
          </div>
        ) : null}
      </div>
      {expanded ? (
        <div className="border-t px-4 py-3">
          <ul className="space-y-2">
            {(batch.requests ?? []).map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <Button variant="link" className="h-auto min-h-11 p-0" asChild>
                  <Link href={ROUTES.platformWithdrawal(request.id)}>
                    #{request.id} ·{' '}
                    {tenantNames.get(request.tenantId) ?? `#${request.tenantId}`}
                  </Link>
                </Button>
                <span className="text-muted-foreground">
                  {request.amount.toLocaleString()}₮ · {tStatus(request.status)}
                </span>
              </li>
            ))}
            {(batch.requests ?? []).length === 0 ? (
              <li className="text-muted-foreground text-sm">{tEntities('empty')}</li>
            ) : null}
          </ul>
        </div>
      ) : null}
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
            <AlertDialogDescription>{t('batchRejectConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`batch-reject-${batch.id}`}>{t('rejectReason')}</Label>
            <Textarea
              id={`batch-reject-${batch.id}`}
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
              {reject.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
