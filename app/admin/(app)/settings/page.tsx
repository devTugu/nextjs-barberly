import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { AdminSettingsGeneralForm } from '@/features/admin-settings';
import { AdminSettingsHub } from '@/features/admin-settings';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';

export default async function AdminSettingsPage() {
  const tNav = await getTranslations('nav');
  return (
    <RequirePermission permission={PERMISSION_CODES.TENANT_SETTINGS_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={tNav('adminSettings')} />
        <AdminSettingsGeneralForm />
        <AdminSettingsHub />
      </div>
    </RequirePermission>
  );
}
