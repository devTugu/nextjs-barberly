import { AdminAuthBrandEffect } from '@/features/admin-auth/ui/admin-auth-brand-effect';

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminAuthBrandEffect />
      {children}
    </>
  );
}
