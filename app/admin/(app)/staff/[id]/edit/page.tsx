import { getTranslations } from 'next-intl/server';
import { RequirePermission } from '@/features/auth';
import { PERMISSION_CODES } from '@/shared/config/permissions';
import { AdminPageHeader } from '@/shared/ui/admin-page-header';
import { AdminStaffForm } from '@/widgets/admin-staff';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminStaffEditPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('entities.tenantStaff');

  return (
    <RequirePermission permission={PERMISSION_CODES.STAFF_READ}>
      <div className="space-y-6">
        <AdminPageHeader title={t('editTitle')} description={t('editDescription')} />
        <AdminStaffForm staffId={Number(id)} />
      </div>
    </RequirePermission>
  );
}
