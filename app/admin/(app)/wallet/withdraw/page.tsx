import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/config/routes';

export default function AdminWalletWithdrawRedirect() {
  redirect(`${ROUTES.ADMIN_WALLET}?withdraw=1`);
}
