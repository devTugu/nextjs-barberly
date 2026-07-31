'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { CustomerAuthFlow, type CustomerAuthFlowProps } from './customer-auth-flow';

interface CustomerAuthDialogProps extends CustomerAuthFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerAuthDialog({
  open,
  onOpenChange,
  onComplete,
  ...flowProps
}: CustomerAuthDialogProps) {
  const t = useTranslations('customerAuth');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card text-card-foreground">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('signInTitle')}</DialogTitle>
        </DialogHeader>
        <CustomerAuthFlow
          key={`${open}-${flowProps.initialStep ?? 'phone'}`}
          {...flowProps}
          onComplete={() => {
            onOpenChange(false);
            onComplete?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
