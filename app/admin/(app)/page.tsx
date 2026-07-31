import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

export default function AdminIndexPage() {
  redirect(ROUTES.ADMIN_DASHBOARD);
}
