import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

export default function AdminServicesNewRedirect() {
  redirect(`${ROUTES.ADMIN_SERVICES}?create=1`);
}
