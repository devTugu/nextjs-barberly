import { CustomerAppShell } from '@/widgets/customer-shell';

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <CustomerAppShell hideNav>{children}</CustomerAppShell>;
}
