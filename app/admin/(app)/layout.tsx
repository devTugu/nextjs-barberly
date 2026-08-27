'use client';

import { AuthGuard, SessionExpiryDialog, TokenRefreshScheduler } from '@/features/auth';
import { AdminSidebar } from '@/widgets/admin-sidebar';
import { SiteHeader } from '@/widgets/app-sidebar';
import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';
import { AdminAppShell } from '@/widgets/admin-shell';
import { AdminPwaBootstrap } from '@/widgets/admin-pwa';
import { PushPermissionBanner } from '@/widgets/admin-pwa';
import { PageTransition } from '@/shared/ui/page-transition';
import { useTranslations } from 'next-intl';
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('common');

  return (
    <AuthGuard>
      <CsrfBootstrap />
      <TokenRefreshScheduler />
      <SessionExpiryDialog />
      <AdminPwaBootstrap />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        {t('skipToContent')}
      </a>
      <AdminAppShell>
        <SidebarProvider
          className="min-h-svh"
          style={
            {
              '--sidebar-width': '16rem',
            } as React.CSSProperties
          }
        >
          <AdminSidebar />
          <SidebarInset className="md:peer-data-[variant=inset]:m-0">
            <div className="hidden md:block">
              <PushPermissionBanner />
              <SiteHeader />
            </div>
            <PageTransition className="flex flex-1 flex-col p-0 md:p-6">
              <main id="main-content" className="md:px-0">
                {children}
              </main>
            </PageTransition>
          </SidebarInset>
        </SidebarProvider>
      </AdminAppShell>
    </AuthGuard>
  );
}
