'use client';

import { brandPrimaryButtonClass } from '@/shared/lib/brand-styles';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useTenantLanding } from './tenant-landing-context';

interface TenantBookButtonProps {
  className?: string;
  size?: 'sm' | 'default';
  children: React.ReactNode;
}

export function TenantBookButton({
  className,
  size = 'default',
  children,
}: TenantBookButtonProps) {
  const { handleBookClick } = useTenantLanding();
  return (
    <Button
      type="button"
      size={size}
      onClick={() => void handleBookClick()}
      className={cn(brandPrimaryButtonClass, className)}
    >
      {children}
    </Button>
  );
}
