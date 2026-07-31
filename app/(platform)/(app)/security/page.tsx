import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/widgets/admin-page-header';
import { MfaSettingsPanel } from '@/features/mfa';

export default async function SecurityPage() {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('security');

  return (
    <div className="space-y-6">
      <AdminPageHeader title={tNav('security')} description={t('pageDescription')} />
      <MfaSettingsPanel />
    </div>
  );
}
