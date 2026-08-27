'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type {
  EmploymentType,
  StaffCompensationOutput,
  StaffOutput,
} from '@/entities/staff';
import {
  useCreateStaff,
  useLinkStaffToBranch,
  useUpdateStaff,
  useUpsertStaffCompensation,
} from '@/entities/staff';
import { getErrorMessage } from '@/shared/api';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { AdminStaffCompensationCard } from './admin-staff-compensation-card';

export interface TenantMembership {
  tenantId: number;
  subdomain: string;
  name: string;
}

interface AdminStaffFormLoadedProps {
  isEdit: boolean;
  detail?: StaffOutput;
  compensation?: StaffCompensationOutput;
  memberships: TenantMembership[];
  createStaff: ReturnType<typeof useCreateStaff>;
  updateStaff: ReturnType<typeof useUpdateStaff>;
  upsertCompensation: ReturnType<typeof useUpsertStaffCompensation>;
  linkStaff: ReturnType<typeof useLinkStaffToBranch>;
}

export function AdminStaffFormLoaded({
  isEdit,
  detail,
  compensation,
  memberships,
  createStaff,
  updateStaff,
  upsertCompensation,
  linkStaff,
}: AdminStaffFormLoadedProps) {
  const t = useTranslations('entities.tenantStaff');
  const router = useRouter();
  const [displayName, setDisplayName] = useState(detail?.displayName ?? '');
  const [phone, setPhone] = useState(detail?.phone ?? '');
  const [isActive, setIsActive] = useState(detail?.isActive ?? true);
  const [isDefault, setIsDefault] = useState(detail?.isDefault ?? false);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    compensation?.employmentType ?? 'salaried',
  );
  const [staffSharePercent, setStaffSharePercent] = useState(
    String(compensation?.staffSharePercent ?? 0),
  );
  const [rentPercent, setRentPercent] = useState(
    compensation?.rentPercent != null ? String(compensation.rentPercent) : '',
  );
  const [rentFixed, setRentFixed] = useState(
    compensation?.rentFixed != null ? String(compensation.rentFixed) : '',
  );
  const [targetTenantId, setTargetTenantId] = useState('');

  const saving =
    createStaff.isPending ||
    updateStaff.isPending ||
    upsertCompensation.isPending;
  const linkTargets = memberships.filter(
    (item) => item.tenantId !== detail?.tenantId,
  );

  const handleSubmit = async () => {
    if (!displayName.trim()) return;
    try {
      if (isEdit) {
        await updateStaff.mutateAsync({
          displayName: displayName.trim(),
          phone: phone.trim() || null,
          isActive,
          isDefault,
        });
        await upsertCompensation.mutateAsync({
          employmentType,
          staffSharePercent: Number(staffSharePercent) || 0,
          rentPercent: rentPercent ? Number(rentPercent) : null,
          rentFixed: rentFixed ? Number(rentFixed) : null,
        });
        toast.success('Staff updated');
        router.push(ROUTES.ADMIN_STAFF);
        return;
      }
      const created = await createStaff.mutateAsync({
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
        isDefault,
      });
      toast.success('Staff created');
      router.push(ROUTES.adminStaffEdit(created.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleLinkBranch = async () => {
    if (!phone.trim()) {
      toast.error(t('linkBranchNeedPhone'));
      return;
    }
    const targetId = Number(targetTenantId);
    if (!targetId) return;
    try {
      await linkStaff.mutateAsync({ targetTenantId: targetId });
      toast.success(t('linkBranchSuccess'));
      setTargetTenantId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit staff' : 'Add staff'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone (OTP login)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+976..."
            />
          </div>
          {isEdit ? (
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <Label htmlFor="isDefault">Default barber</Label>
            <Switch
              id="isDefault"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
          </div>
        </CardContent>
      </Card>

      {isEdit ? (
        <AdminStaffCompensationCard
          employmentType={employmentType}
          staffSharePercent={staffSharePercent}
          rentPercent={rentPercent}
          rentFixed={rentFixed}
          onEmploymentTypeChange={setEmploymentType}
          onStaffSharePercentChange={setStaffSharePercent}
          onRentPercentChange={setRentPercent}
          onRentFixedChange={setRentFixed}
        />
      ) : null}

      {isEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('linkBranchTitle')}</CardTitle>
            <CardDescription>{t('linkBranchDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkTargets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('linkBranchNoTargets')}
              </p>
            ) : (
              <>
                <div>
                  <Label>{t('linkBranchSelect')}</Label>
                  <Select
                    value={targetTenantId}
                    onValueChange={setTargetTenantId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('linkBranchSelect')} />
                    </SelectTrigger>
                    <SelectContent>
                      {linkTargets.map((item) => (
                        <SelectItem
                          key={item.tenantId}
                          value={String(item.tenantId)}
                        >
                          {item.name} ({item.subdomain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!targetTenantId || linkStaff.isPending}
                  onClick={() => void handleLinkBranch()}
                >
                  {linkStaff.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t('linkBranchAction')
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push(ROUTES.ADMIN_STAFF)}>
          Cancel
        </Button>
        <Button disabled={saving} onClick={() => void handleSubmit()}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  );
}
