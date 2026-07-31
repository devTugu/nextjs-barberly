import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { AdminLoyaltySettingsPanel } from '@/features/admin-settings/ui/admin-loyalty-settings';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';

export default async function AdminLoyaltySettingsPage() {
  const t = await getTranslations('adminSettings');

  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_SETTINGS_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={t('loyalty')} description={t('loyaltyDescription')} />
        <AdminLoyaltySettingsPanel />
      </div>
    </RequirePermission>
  );
}
