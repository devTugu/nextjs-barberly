'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { useStaffList } from '@/entities/staff';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageEmpty, PageLoading } from '@/shared/ui/page-states';
import { Badge } from '@/shared/ui/badge';

export function AdminStaffPanel() {
  const t = useTranslations('entities.tenantStaff');
  const tenant = useTenantSubdomain();
  const { data, isLoading } = useStaffList(tenant);

  if (isLoading) return <PageLoading />;

  const members = data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={ROUTES.ADMIN_STAFF_NEW}>{t('addStaff')}</Link>
        </Button>
      </div>
      {members.length === 0 ? (
        <PageEmpty title={t('emptyTitle')} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle>{member.displayName}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Badge variant={member.isActive ? 'default' : 'secondary'}>
                  {member.isActive ? t('active') : t('inactive')}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.adminStaffEdit(member.id)}>{t('edit')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
