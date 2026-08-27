'use client';

import { useTranslations } from 'next-intl';
import { useTenant, useTenants } from '@/entities/tenant';
import { Skeleton } from '@/shared/ui/skeleton';
import { TenantContractForm } from './tenant-contract-form';
import { TenantEditForm } from './tenant-edit-form';

export function TenantEditPage({ id }: { id: number }) {
  const tCommon = useTranslations('common');
  const { data, isLoading } = useTenant(id);
  const { data: tenantsList } = useTenants({ page: 1, limit: 100 });
  const brandRoots = (tenantsList?.items ?? []).filter(
    (tenant) => tenant.parentTenantId == null && tenant.id !== id,
  );

  if (isLoading) {
    return <Skeleton className="mx-auto h-64 max-w-lg" />;
  }
  if (!data) {
    return <p className="text-muted-foreground text-sm">{tCommon('notFound')}</p>;
  }

  return (
    <>
      <TenantEditForm key={data.id} id={id} data={data} brandRoots={brandRoots} />
      <TenantContractForm tenantId={id} />
    </>
  );
}
