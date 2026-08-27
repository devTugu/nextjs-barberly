import { AdminTenantLoginShell } from '@/widgets/admin-auth';

interface PageProps {
  searchParams?: Promise<{ tenant?: string | string[] }>;
}

function getTenantParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <AdminTenantLoginShell queryTenant={getTenantParam(params?.tenant)} />;
}
