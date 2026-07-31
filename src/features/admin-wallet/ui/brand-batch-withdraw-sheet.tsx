'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useBrandBranchBalances,
  useRequestWithdrawalBatch,
} from '@/entities/wallet';
import { useAuthPermissions } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { AdminFormSheet } from '@/widgets/admin-form-sheet';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface BrandBatchWithdrawSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BranchDraft = {
  tenantId: number;
  selected: boolean;
  amount: number;
};

export function BrandBatchWithdrawSheet({
  open,
  onOpenChange,
}: BrandBatchWithdrawSheetProps) {
  const t = useTranslations('entities.wallet');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const { can } = useAuthPermissions();
  const balancesQuery = useBrandBranchBalances(tenant, open);
  const batchWithdraw = useRequestWithdrawalBatch(tenant);
  const [reference, setReference] = useState('');
  const [drafts, setDrafts] = useState<BranchDraft[]>([]);

  useEffect(() => {
    if (!open || !balancesQuery.data) return;
    setReference('');
    setDrafts(
      balancesQuery.data.branches.map((branch) => ({
        tenantId: branch.tenantId,
        selected: branch.balance > 0,
        amount: branch.balance > 0 ? branch.balance : 0,
      })),
    );
  }, [open, balancesQuery.data]);

  const branchById = useMemo(() => {
    const map = new Map(
      (balancesQuery.data?.branches ?? []).map((b) => [b.tenantId, b]),
    );
    return map;
  }, [balancesQuery.data?.branches]);

  const selectedItems = drafts.filter((d) => d.selected && d.amount > 0);
  const total = selectedItems.reduce((sum, d) => sum + d.amount, 0);
  const allSelected =
    drafts.length > 0 && drafts.every((d) => d.selected || branchById.get(d.tenantId)?.balance === 0);
  const someSelected = drafts.some((d) => d.selected);

  if (!open) return null;

  const canSubmit = can(PERMISSION_CODES.WALLET_UPDATE);
  const isPending = batchWithdraw.isPending;

  const toggleAll = (checked: boolean) => {
    setDrafts((prev) =>
      prev.map((d) => {
        const balance = branchById.get(d.tenantId)?.balance ?? 0;
        if (balance <= 0) return { ...d, selected: false };
        return {
          ...d,
          selected: checked,
          amount: checked ? (d.amount > 0 ? d.amount : balance) : d.amount,
        };
      }),
    );
  };

  const onSubmit = async () => {
    const invalid = selectedItems.find((item) => {
      const balance = branchById.get(item.tenantId)?.balance ?? 0;
      return item.amount > balance;
    });
    if (invalid) {
      toast.error(t('amountExceedsBalance'));
      return;
    }
    if (selectedItems.length === 0) {
      toast.error(t('batchSelectBranch'));
      return;
    }
    try {
      await batchWithdraw.mutateAsync({
        items: selectedItems.map((item) => ({
          tenantId: item.tenantId,
          amount: item.amount,
        })),
        reference: reference.trim() || undefined,
      });
      toast.success(t('toastBatchWithdrawal'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const footer = canSubmit ? (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isPending}
      >
        {tCommon('cancel')}
      </Button>
      <Button
        type="button"
        onClick={() => void onSubmit()}
        disabled={isPending || selectedItems.length === 0}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t('submitBatchWithdrawal', { total: total.toLocaleString() })}
      </Button>
    </div>
  ) : null;

  return (
    <AdminFormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('batchWithdrawTitle')}
      description={t('batchWithdrawDescription', {
        brand: balancesQuery.data?.brandName ?? '—',
      })}
      showContentLocale={false}
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Checkbox
            id="select-all-branches"
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={(value) => toggleAll(value === true)}
          />
          <Label htmlFor="select-all-branches">{t('batchSelectAll')}</Label>
        </div>

        {balancesQuery.isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            {tCommon('loading')}
          </div>
        ) : (
          <ul className="space-y-3">
            {drafts.map((draft) => {
              const branch = branchById.get(draft.tenantId);
              if (!branch) return null;
              const disabled = branch.balance <= 0;
              return (
                <li
                  key={draft.tenantId}
                  className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <Checkbox
                    id={`branch-${draft.tenantId}`}
                    checked={draft.selected}
                    disabled={disabled}
                    onCheckedChange={(value) =>
                      setDrafts((prev) =>
                        prev.map((d) =>
                          d.tenantId === draft.tenantId
                            ? {
                                ...d,
                                selected: value === true,
                                amount:
                                  value === true && d.amount <= 0
                                    ? branch.balance
                                    : d.amount,
                              }
                            : d,
                        ),
                      )
                    }
                  />
                  <Label
                    htmlFor={`branch-${draft.tenantId}`}
                    className="min-w-0"
                  >
                    <span className="block truncate font-medium">
                      {branch.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {branch.balance.toLocaleString()}₮ · {branch.subdomain}
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={branch.balance}
                    disabled={!draft.selected || disabled}
                    value={draft.amount || ''}
                    onChange={(e) => {
                      const amount = e.target.valueAsNumber || 0;
                      setDrafts((prev) =>
                        prev.map((d) =>
                          d.tenantId === draft.tenantId ? { ...d, amount } : d,
                        ),
                      );
                    }}
                    className="w-full sm:w-32"
                  />
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-2">
          <Label htmlFor="batch-reference">{t('referenceLabel')}</Label>
          <Input
            id="batch-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t('referencePlaceholder')}
          />
        </div>
      </div>
    </AdminFormSheet>
  );
}
