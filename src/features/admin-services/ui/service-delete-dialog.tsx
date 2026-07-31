'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { type ServiceOutput, useDeleteService } from '@/entities/service';
import { getErrorMessage } from '@/shared/api';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

interface ServiceDeleteDialogProps {
  service: ServiceOutput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDeleteDialog({
  service,
  open,
  onOpenChange,
}: ServiceDeleteDialogProps) {
  const t = useTranslations('entities.services');
  const tCommon = useTranslations('common');
  const tenant = useTenantSubdomain();
  const deleteService = useDeleteService(tenant);

  const handleDelete = async () => {
    if (!service) return;
    try {
      await deleteService.mutateAsync(service.id);
      toast.success(t('toastDeleted'));
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDescription', { name: service?.name ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteService.isPending}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteService.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteService.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {tCommon('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
