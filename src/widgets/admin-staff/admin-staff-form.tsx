'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useCreateStaff,
  useLinkStaffToBranch,
  useStaffCompensation,
  useStaffDetail,
  useUpdateStaff,
  useUpsertStaffCompensation,
  type EmploymentType,
} from '@/entities/staff';
import { api, getErrorMessage } from '@/shared/api';
import { API_ENDPOINTS } from '@/shared/config/api.config';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
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
import { PageLoading } from '@/shared/ui/page-states';

interface AdminStaffFormProps {
  staffId?: number;
}

interface TenantMembership {
  tenantId: number;
  subdomain: string;
  name: string;
}

export function AdminStaffForm({ staffId }: AdminStaffFormProps) {
  const t = useTranslations('entities.tenantStaff');
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const isEdit = staffId != null && staffId > 0;
  const detailQuery = useStaffDetail(tenant, staffId ?? 0, isEdit);
  const compensationQuery = useStaffCompensation(tenant, staffId ?? 0, isEdit);
  const createStaff = useCreateStaff(tenant);
  const updateStaff = useUpdateStaff(tenant, staffId ?? 0);
  const upsertCompensation = useUpsertStaffCompensation(tenant, staffId ?? 0);
  const linkStaff = useLinkStaffToBranch(tenant, staffId ?? 0);

  const membershipsQuery = useQuery({
    queryKey: ['auth', 'my-tenants'],
    queryFn: () =>
      api.get<{ items: TenantMembership[] }>(API_ENDPOINTS.AUTH.MY_TENANTS),
    enabled: isEdit,
  });

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('salaried');
  const [staffSharePercent, setStaffSharePercent] = useState('0');
  const [rentPercent, setRentPercent] = useState('');
  const [rentFixed, setRentFixed] = useState('');
  const [targetTenantId, setTargetTenantId] = useState('');

  useEffect(() => {
    if (!detailQuery.data) return;
    setDisplayName(detailQuery.data.displayName);
    setPhone(detailQuery.data.phone ?? '');
    setIsActive(detailQuery.data.isActive);
    setIsDefault(detailQuery.data.isDefault);
  }, [detailQuery.data]);

  useEffect(() => {
    if (!compensationQuery.data) return;
    setEmploymentType(compensationQuery.data.employmentType);
    setStaffSharePercent(String(compensationQuery.data.staffSharePercent));
    setRentPercent(
      compensationQuery.data.rentPercent != null
        ? String(compensationQuery.data.rentPercent)
        : '',
    );
    setRentFixed(
      compensationQuery.data.rentFixed != null
        ? String(compensationQuery.data.rentFixed)
        : '',
    );
  }, [compensationQuery.data]);

  if (isEdit && (detailQuery.isLoading || compensationQuery.isLoading)) {
    return <PageLoading />;
  }

  const saving =
    createStaff.isPending || updateStaff.isPending || upsertCompensation.isPending;

  const currentTenantId = detailQuery.data?.tenantId;
  const linkTargets = (membershipsQuery.data?.items ?? []).filter(
    (item) => item.tenantId !== currentTenantId,
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
      } else {
        const created = await createStaff.mutateAsync({
          displayName: displayName.trim(),
          phone: phone.trim() || undefined,
          isDefault,
        });
        toast.success('Staff created');
        router.push(ROUTES.adminStaffEdit(created.id));
      }
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
        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Employment type</Label>
              <Select
                value={employmentType}
                onValueChange={(v) => setEmploymentType(v as EmploymentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="chair_rent">Chair rent</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {employmentType !== 'salaried' ? (
              <div>
                <Label htmlFor="staffShare">Staff share %</Label>
                <Input
                  id="staffShare"
                  type="number"
                  min={0}
                  max={100}
                  value={staffSharePercent}
                  onChange={(e) => setStaffSharePercent(e.target.value)}
                />
              </div>
            ) : null}
            {employmentType === 'chair_rent' ? (
              <>
                <div>
                  <Label htmlFor="rentPercent">Rent % (monthly)</Label>
                  <Input
                    id="rentPercent"
                    type="number"
                    min={0}
                    max={100}
                    value={rentPercent}
                    onChange={(e) => setRentPercent(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rentFixed">Rent fixed (MNT)</Label>
                  <Input
                    id="rentFixed"
                    type="number"
                    min={0}
                    value={rentFixed}
                    onChange={(e) => setRentFixed(e.target.value)}
                  />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
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
