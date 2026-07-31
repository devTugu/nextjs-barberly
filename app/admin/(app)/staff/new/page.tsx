import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { AdminStaffForm } from '@/widgets/admin-staff/admin-staff-form';

export default async function AdminStaffNewPage() {
  const t = await getTranslations('entities.tenantStaff');

  return (
    <RequirePermission permission={PERMISSION_CODES.STAFF_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={t('createTitle')} description={t('createDescription')} />
        <AdminStaffForm />
      </div>
    </RequirePermission>
  );
}
