import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminServiceEditRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`${ROUTES.ADMIN_SERVICES}?edit=${id}`);
}
