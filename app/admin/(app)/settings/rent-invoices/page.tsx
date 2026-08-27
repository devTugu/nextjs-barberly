import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { AdminRentInvoicesPanel } from '@/features/admin-settings';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';

export default async function AdminRentInvoicesPage() {
  const t = await getTranslations('adminSettings');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_SETTINGS_READ}>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('rentInvoices')}
          description={t('rentInvoicesDescription')}
        />
        <AdminRentInvoicesPanel />
      </div>
    </RequirePermission>
  );
}
