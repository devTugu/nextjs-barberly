import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

export default function SignInRedirectPage() {
  redirect(ROUTES.PLATFORM_LOGIN);
}
