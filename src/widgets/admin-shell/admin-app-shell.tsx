'use client';

import { AdminBottomNav } from './admin-bottom-nav';
import { TenantBrandBootstrap } from '@/shared/ui/tenant-brand-bootstrap';

interface AdminAppShellProps {
  children: React.ReactNode;
}

export function AdminAppShell({ children }: AdminAppShellProps) {
  return (
    <div className="admin-app dark min-h-svh bg-background text-foreground">
      <TenantBrandBootstrap />
      <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:max-w-none md:pb-0">
        {children}
      </div>
      <AdminBottomNav />
    </div>
  );
}
