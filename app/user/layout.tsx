import { CustomerAppShell } from '@/widgets/customer-shell';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <CustomerAppShell>{children}</CustomerAppShell>;
}
