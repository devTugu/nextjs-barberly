import { AdminAuthBrandEffect } from '@/widgets/admin-auth';

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
