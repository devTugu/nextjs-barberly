import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

export default function AdminScheduleExceptionsPage() {
  redirect(`${ROUTES.ADMIN_SCHEDULE}?tab=day-exceptions`);
}
