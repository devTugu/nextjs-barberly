'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceManageSheet } from './service-manage-sheet';
import { useService } from '@/entities/service';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { ROUTES } from '@/shared/config/routes';
import { Skeleton } from '@/shared/ui/skeleton';

interface AdminServiceEditPageProps {
  serviceId: number;
}

export function AdminServiceEditPage({ serviceId }: AdminServiceEditPageProps) {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const { data: service, isLoading } = useService(tenant, serviceId);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.push(ROUTES.ADMIN_SERVICES);
    }
  }, [open, router]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full max-w-lg" />;
  }

  if (!service) {
    return <p className="text-muted-foreground text-sm">Service not found.</p>;
  }

  return (
    <ServiceManageSheet
      state={{ mode: 'edit', service }}
      onOpenChange={setOpen}
    />
  );
}
