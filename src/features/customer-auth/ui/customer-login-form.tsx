'use client';

import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { CustomerAuthFlow } from './customer-auth-flow';

export function CustomerLoginForm() {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();

  return (
    <div className="px-4 py-6">
      <Card className="rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle>{t('signIn')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerAuthFlow
            tenant={tenant}
            redirectTo={ROUTES.USER_DASHBOARD}
          />
        </CardContent>
      </Card>
    </div>
  );
}
